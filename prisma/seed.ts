import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function rawSql() {
    const queries = [
        `
        CREATE OR REPLACE FUNCTION get_open_orders()
        RETURNS TABLE (
            bestelling_id INT,
            tafel INT,
            bar INT,
            item_naam TEXT,
            aantal INT,
            notities TEXT,
            totaal_prijs_per_item DOUBLE PRECISION,
            is_snack BOOLEAN
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                b.bestelling_id, 
                b.tafel,
                b.bar,
                CASE
                    WHEN bp.product_id IS NOT NULL THEN p.product_naam
                    WHEN bp.snack_id IS NOT NULL THEN s.snack_naam
                END AS item_naam,
                bp.aantal,
                b.notities,
                CASE
                    WHEN bp.product_id IS NOT NULL THEN p.product_prijs * bp.aantal
                    WHEN bp.snack_id IS NOT NULL THEN s.snack_prijs * bp.aantal
                END AS totaal_prijs_per_item,
                CASE
                    WHEN bp.product_id IS NOT NULL THEN false
                    WHEN bp.snack_id IS NOT NULL THEN true
                END AS is_snack
            FROM bestellingen b
            INNER JOIN bestelling_product bp ON b.bestelling_id = bp.bestelling_id
            LEFT JOIN producten p ON bp.product_id = p.product_id
            LEFT JOIN snacks s ON bp.snack_id = s.snack_id
            WHERE b.bezorgd != TRUE
            ORDER BY b.bestelling_id;
        END;
        $$ LANGUAGE plpgsql;
        `,
        `
        CREATE OR REPLACE FUNCTION get_db_instellingen()
        RETURNS JSONB AS $$
        DECLARE
          dranken_list JSONB;
          snack_list JSONB;
          setup_list JSONB;
          hoogste_tafelnummer INT;
          barindeling JSONB := '[]'::jsonb;
          hoogste_barnummer INT;
          row RECORD;
          key TEXT;
          value INT;
          i INT;
          col_record RECORD;
          col_name_var TEXT;
          bar_columns TEXT[] := ARRAY[]::TEXT[];
        BEGIN
          RAISE NOTICE 'Start get_db_instellingen functie';
          SELECT jsonb_agg(jsonb_build_object(p.product_naam, p.product_prijs))
          INTO dranken_list
          FROM producten p;
          RAISE NOTICE 'Dranken lijst opgehaald: %', dranken_list;
          SELECT jsonb_agg(jsonb_build_object(s.snack_naam, s.snack_prijs))
          INTO snack_list
          FROM snacks s;
          RAISE NOTICE 'Snacks lijst opgehaald: %', snack_list;
          SELECT jsonb_agg(to_jsonb(setup))
          INTO setup_list
          FROM setup;
          RAISE NOTICE 'Setup lijst opgehaald: %', setup_list;
          FOR col_record IN
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'setup' AND column_name LIKE 'bar_%'
          LOOP
            bar_columns := array_append(bar_columns, col_record.column_name);
          END LOOP;
          RAISE NOTICE 'Bar kolommen gevonden: %', bar_columns;
          IF array_length(bar_columns, 1) > 0 THEN
            EXECUTE format('SELECT COALESCE(MAX(GREATEST(%s)), 0) FROM setup', array_to_string(bar_columns, ', '))
            INTO hoogste_tafelnummer;
            RAISE NOTICE 'Hoogste tafelnummer bepaald: %', hoogste_tafelnummer;
          ELSE
            hoogste_tafelnummer := 0;
            RAISE NOTICE 'Geen bar kolommen gevonden, hoogste tafelnummer is 0';
          END IF;
          IF hoogste_tafelnummer > 0 THEN
            FOR i IN 0..hoogste_tafelnummer LOOP
              barindeling := jsonb_set(barindeling, ARRAY[i]::TEXT[], '"null"'::jsonb, true);
            END LOOP;
            RAISE NOTICE 'Barindeling geïnitialiseerd: %', barindeling;
            FOR row IN SELECT * FROM setup LOOP
              FOR i IN array_lower(bar_columns, 1)..array_upper(bar_columns, 1) LOOP
                col_name_var := bar_columns[i];
                EXECUTE format('SELECT %I FROM setup WHERE setup_id = $1', col_name_var) INTO value USING row.setup_id;
                IF value IS NOT NULL THEN
                  barindeling := jsonb_set(barindeling, ARRAY[value]::TEXT[], to_jsonb(split_part(col_name_var, '_', 2)), true);
                END IF;
              END LOOP;
            END LOOP;
            RAISE NOTICE 'Barindeling bijgewerkt: %', barindeling;
          END IF;
          IF array_length(bar_columns, 1) > 0 THEN
            SELECT MAX(split_part(column_name, '_', 2)::int) INTO hoogste_barnummer
            FROM unnest(bar_columns) AS column_name;
            RAISE NOTICE 'Hoogste barnummer bepaald: %', hoogste_barnummer;
          ELSE
            hoogste_barnummer := 0;
            RAISE NOTICE 'Geen bar kolommen gevonden, hoogste barnummer is 0';
          END IF;
          RETURN jsonb_build_object(
            'dranken', dranken_list,
            'snacks', snack_list,
            'barindeling', barindeling,
            'tafelcount', hoogste_tafelnummer,
            'barcount', hoogste_barnummer
          );
        END;
        $$ LANGUAGE plpgsql;
        `,
        `
        CREATE TABLE trigger_tabel (
          trigger_id SERIAL PRIMARY KEY,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          used BOOLEAN DEFAULT FALSE
        );
        `,
        `
        CREATE OR REPLACE FUNCTION reset_database()
        RETURNS void AS $$
        BEGIN
            BEGIN
                DELETE FROM bar_tafel_relatie;
                DELETE FROM bars;
                DELETE FROM bestelling_product;
                DELETE FROM bestellingen;
                DELETE FROM producten;
                DELETE FROM setup;
                DELETE FROM snacks;
                DELETE FROM tafels;
                RAISE NOTICE 'Database reset successfully';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE EXCEPTION 'An error occurred during the database reset: %', SQLERRM;
            END;
        END;
        $$ LANGUAGE plpgsql;
        `,
        `
        CREATE OR REPLACE FUNCTION update_tables(
          _dranken JSONB,
          _snacks_input JSONB,
          _barindeling JSONB,
          _barcount INT
        ) RETURNS VOID AS $$
        DECLARE
          dranken_item_var JSONB;
          dranken_key_var TEXT;
          dranken_value_var DOUBLE PRECISION;
          snacks_item_var JSONB;
          snacks_key_var TEXT;
          snacks_value_var DOUBLE PRECISION;
          bar_value_var TEXT;
          tafel_id_var INT;
          setup_col_name_var TEXT;
          column_record_var RECORD;
        BEGIN
          DELETE FROM producten;
          FOR dranken_item_var IN SELECT * FROM jsonb_array_elements(_dranken) LOOP
            SELECT * INTO dranken_key_var, dranken_value_var FROM jsonb_each(dranken_item_var);
            INSERT INTO producten (product_naam, product_prijs) VALUES (dranken_key_var, dranken_value_var)
            ON CONFLICT (product_naam) DO UPDATE SET product_prijs = EXCLUDED.product_prijs;
          END LOOP;
          DELETE FROM snacks;
          FOR snacks_item_var IN SELECT * FROM jsonb_array_elements(_snacks_input) LOOP
            SELECT * INTO snacks_key_var, snacks_value_var FROM jsonb_each(snacks_item_var);
            INSERT INTO snacks (snack_naam, snack_prijs) VALUES (snacks_key_var, snacks_value_var)
            ON CONFLICT (snack_naam) DO UPDATE SET snack_prijs = EXCLUDED.snack_prijs;
          END LOOP;
          FOR column_record_var IN SELECT column_name FROM information_schema.columns WHERE table_name = 'setup' AND column_name LIKE 'bar_%' LOOP
            EXECUTE format('ALTER TABLE setup DROP COLUMN IF EXISTS %I', column_record_var.column_name);
          END LOOP;
          DELETE FROM setup;
          DELETE FROM bar_tafel_relatie;
          DELETE FROM tafels;
          DELETE FROM bars;
          FOR bar_value_var IN SELECT DISTINCT value FROM jsonb_array_elements_text(_barindeling) WHERE value IS NOT NULL AND value <> 'null' LOOP
            INSERT INTO bars (bar_id, bar_naam) VALUES (bar_value_var::INT, 'Bar ' || bar_value_var)
            ON CONFLICT (bar_id) DO NOTHING;
          END LOOP;
          FOR tafel_id_var IN SELECT generate_series(0, jsonb_array_length(_barindeling) - 1) LOOP
            bar_value_var := (_barindeling->>tafel_id_var)::TEXT;
            IF bar_value_var IS NOT NULL AND bar_value_var <> 'null' THEN
              INSERT INTO tafels (tafel_id) VALUES (tafel_id_var) ON CONFLICT (tafel_id) DO NOTHING;
              INSERT INTO bar_tafel_relatie (bar_id, tafel_id) VALUES (bar_value_var::INT, tafel_id_var);
            END IF;
          END LOOP;
          FOR i IN 1.._barcount LOOP
            EXECUTE format('ALTER TABLE setup ADD COLUMN IF NOT EXISTS bar_%s INTEGER', i);
          END LOOP;
          FOR tafel_id_var IN SELECT generate_series(0, jsonb_array_length(_barindeling) - 1) LOOP
            bar_value_var := (_barindeling->>tafel_id_var)::TEXT;
            IF bar_value_var IS NOT NULL AND bar_value_var <> 'null' THEN
              setup_col_name_var := format('bar_%s', bar_value_var);
              EXECUTE format('INSERT INTO setup (%I) VALUES (%L)', setup_col_name_var, tafel_id_var);
            END IF;
          END LOOP;
        END;
        $$ LANGUAGE plpgsql;
        `,
        `
        CREATE TABLE IF NOT EXISTS logboek (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            log_level VARCHAR(10),
            message TEXT
        );
        `,
        `
        CREATE OR REPLACE FUNCTION add_log(log_level VARCHAR, log_message TEXT)
        RETURNS VOID AS $$
        BEGIN
            INSERT INTO logboek (log_level, message)
            VALUES (log_level, log_message);
        END;
        $$ LANGUAGE plpgsql;
        `,
        `
        CREATE OR REPLACE FUNCTION notify_change()
        RETURNS TRIGGER AS $$
        BEGIN
            PERFORM pg_notify('table_update', row_to_json(NEW)::text);
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `,
        `
        CREATE TRIGGER order_update_trigger
        AFTER INSERT OR UPDATE ON trigger_tabel
        FOR EACH ROW EXECUTE FUNCTION notify_change();
        `
    ];

    for (const query of queries) {
        try {
            const result = await prisma.$executeRawUnsafe(query);
            console.log({ result });
        } catch (e) {
            console.error(e);
            await prisma.$disconnect();
            process.exit(1);
        }
    }
}

rawSql()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });