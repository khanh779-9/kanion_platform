-- --------------------------------------------------------
-- Máy chủ:                      db.cmcbomljqmmbkzjbthcw.supabase.co
-- Server version:               PostgreSQL 17.6 on aarch64-unknown-linux-gnu, compiled by gcc (GCC) 13.2.0, 64-bit
-- Server OS:                    
-- HeidiSQL Phiên bản:           12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES  */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for function account.pg_get_coldef
DELIMITER //
CREATE FUNCTION "pg_get_coldef"(in_schema TEXT, in_table TEXT, in_column TEXT, oldway BOOLEAN) RETURNS TEXT AS $$ 
 DECLARE
 v_coldef     text;
 v_dt1        text;
 v_dt2        text;
 v_dt3        text;
 v_nullable   boolean;
 v_position   int;
 v_identity   text;
 v_generated  text;
 v_hasdflt    boolean;
 v_dfltexpr   text;
 
 BEGIN
   IF oldway THEN
     SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) INTO v_coldef FROM pg_namespace n, pg_class c, pg_attribute a, pg_type t
     WHERE n.nspname = in_schema AND n.oid = c.relnamespace AND c.relname = in_table AND a.attname = in_column and a.attnum > 0 AND a.attrelid = c.oid AND a.atttypid = t.oid ORDER BY a.attnum;
     -- RAISE NOTICE 'DEBUG: oldway=%',v_coldef;
   ELSE
 
     SELECT CASE WHEN a.atttypid = ANY ('{int,int8,int2}'::regtype[]) AND EXISTS (SELECT FROM pg_attrdef ad WHERE ad.adrelid = a.attrelid AND ad.adnum   = a.attnum AND
 	  pg_get_expr(ad.adbin, ad.adrelid) = 'nextval(''' || (pg_get_serial_sequence (a.attrelid::regclass::text, a.attname))::regclass || '''::regclass)') THEN CASE a.atttypid
 	  WHEN 'int'::regtype  THEN 'serial' WHEN 'int8'::regtype THEN 'bigserial' WHEN 'int2'::regtype THEN 'smallserial' END ELSE format_type(a.atttypid, a.atttypmod) END AS data_type
 	  INTO v_coldef FROM pg_namespace n, pg_class c, pg_attribute a, pg_type t
 	  WHERE n.nspname = in_schema AND n.oid = c.relnamespace AND c.relname = in_table AND a.attname = in_column and a.attnum > 0 AND a.attrelid = c.oid AND a.atttypid = t.oid ORDER BY a.attnum;
 
 
 
   END IF;
   RETURN v_coldef;
 END;
  $$//
DELIMITER ;

-- Dumping structure for function account.pg_get_tabledef
DELIMITER //
CREATE FUNCTION "pg_get_tabledef"(in_schema VARCHAR, in_table VARCHAR, _verbose BOOLEAN, arr UNKNOWN) RETURNS TEXT AS $$ 
   DECLARE
     v_qualified text := '';
     v_table_ddl text;
     v_table_oid int;
     v_colrec record;
     v_constraintrec record;
     v_trigrec       record;
     v_indexrec record;
     v_rec           record;
     v_constraint_name text;
     v_constraint_def  text;
     v_pkey_def        text := '';
     v_fkey_def        text := '';
     v_fkey_defs       text := '';
     v_trigger text := '';
     v_partition_key text := '';
     v_partbound text;
     v_parent text;
     v_parent_schema text;
     v_persist text;
     v_temp  text := '';
     v_temp2 text;
     v_relopts text;
     v_tablespace text;
     v_pgversion int;
     bSerial boolean;
     bPartition boolean;
     bInheritance boolean;
     bRelispartition boolean;
     constraintarr text[] := '{}';
     constraintelement text;
     bSkip boolean;
 	  bVerbose boolean := False;
 	  v_cnt1   integer;
 	  v_cnt2   integer;
 	  search_path_old text := '';
 	  search_path_new text := '';
 	  v_partial    boolean;
 	  v_pos        integer;
 
 
   	pkcnt            int := 0;
   	fkcnt            int := 0;
 	  trigcnt          int := 0;
 	  cmtcnt           int := 0;
     pktype           tabledefs := 'PKEY_INTERNAL';
     fktype           tabledefs := 'FKEYS_INTERNAL';
     trigtype         tabledefs := 'NO_TRIGGERS';
     arglen           integer;
   	vargs            text;
 	  avarg            tabledefs;
 
 
     v_ret            text;
     v_diag1          text;
     v_diag2          text;
     v_diag3          text;
     v_diag4          text;
     v_diag5          text;
     v_diag6          text;
 
   BEGIN
     SET client_min_messages = 'notice';
     IF _verbose THEN bVerbose = True; END IF;
 
 
 
     arglen := array_length($4, 1);
     IF arglen IS NULL THEN
         -- nothing to do, so assume defaults
         NULL;
     ELSE
 
         IF bVerbose THEN RAISE NOTICE 'arguments=%', $4; END IF;
         FOREACH avarg IN ARRAY $4 LOOP
             IF bVerbose THEN RAISE NOTICE 'arg=%', avarg; END IF;
             IF avarg = 'FKEYS_INTERNAL' OR avarg = 'FKEYS_EXTERNAL' OR avarg = 'FKEYS_NONE' THEN
                 fkcnt = fkcnt + 1;
                 fktype = avarg;
             ELSEIF avarg = 'INCLUDE_TRIGGERS' OR avarg = 'NO_TRIGGERS' THEN
                 trigcnt = trigcnt + 1;
                 trigtype = avarg;
             ELSEIF avarg = 'PKEY_EXTERNAL' THEN
                 pkcnt = pkcnt + 1;
                 pktype = avarg;
             ELSEIF avarg = 'COMMENTS' THEN
                 cmtcnt = cmtcnt + 1;
 
             END IF;
         END LOOP;
         IF fkcnt > 1 THEN
   	        RAISE WARNING 'Only one foreign key option can be provided. You provided %', fkcnt;
 	          RETURN '';
         ELSEIF trigcnt > 1 THEN
             RAISE WARNING 'Only one trigger option can be provided. You provided %', trigcnt;
             RETURN '';
         ELSEIF pkcnt > 1 THEN
             RAISE WARNING 'Only one pkey option can be provided. You provided %', pkcnt;
             RETURN '';
         ELSEIF cmtcnt > 1 THEN
             RAISE WARNING 'Only one comments option can be provided. You provided %', cmtcnt;
             RETURN '';
 
         END IF;
     END IF;
 
     SELECT c.oid, (select setting from pg_settings where name = 'server_version_num') INTO v_table_oid, v_pgversion FROM pg_catalog.pg_class c LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind in ('r','p') AND c.relname = in_table AND n.nspname = in_schema;
 
     SELECT setting INTO search_path_old FROM pg_settings WHERE name = 'search_path';
 
     SELECT REPLACE(REPLACE(setting, '"$user"', '$user'), '$user', '"$user"') INTO search_path_old
     FROM pg_settings
     WHERE name = 'search_path';
 
     EXECUTE 'SET search_path = "public"';
     SELECT setting INTO search_path_new FROM pg_settings WHERE name = 'search_path';
 
     IF (v_table_oid IS NULL) THEN
       RAISE EXCEPTION 'table does not exist';
     END IF;
 
 
     SELECT tablespace INTO v_temp FROM pg_tables WHERE schemaname = in_schema and tablename = in_table and tablespace IS NOT NULL;
     IF v_temp IS NULL THEN
       v_tablespace := 'TABLESPACE pg_default';
     ELSE
       v_tablespace := 'TABLESPACE ' || v_temp;
     END IF;
 
 
     WITH relopts AS (SELECT unnest(c.reloptions) relopts FROM pg_class c, pg_namespace n WHERE n.nspname = in_schema and n.oid = c.relnamespace and c.relname = in_table)
     SELECT string_agg(r.relopts, ', ') as relopts INTO v_temp from relopts r;
     IF v_temp IS NULL THEN
       v_relopts := '';
     ELSE
       v_relopts := ' WITH (' || v_temp || ')';
     END IF;
 
 
     v_partbound := '';
     bPartition := False;
     bInheritance := False;
     IF v_pgversion < 100000 THEN
 
       SELECT c2.relname parent, c2.relnamespace::regnamespace INTO v_parent, v_parent_schema from pg_class c1, pg_namespace n, pg_inherits i, pg_class c2
       WHERE n.nspname = in_schema and n.oid = c1.relnamespace and c1.relname = in_table and c1.oid = i.inhrelid and i.inhparent = c2.oid and c1.relkind = 'r';
       IF (v_parent IS NOT NULL) THEN
         bPartition   := True;
         bInheritance := True;
       END IF;
     ELSE
 
       SELECT c2.relname parent, c1.relispartition, pg_get_expr(c1.relpartbound, c1.oid, true), c2.relnamespace::regnamespace INTO v_parent, bRelispartition, v_partbound, v_parent_schema from pg_class c1, pg_namespace n, pg_inherits i, pg_class c2
       WHERE n.nspname = in_schema and n.oid = c1.relnamespace and c1.relname = in_table and c1.oid = i.inhrelid and i.inhparent = c2.oid and c1.relkind = 'r';
       IF (v_parent IS NOT NULL) THEN
         bPartition   := True;
         IF bRelispartition THEN
           bInheritance := False;
         ELSE
           bInheritance := True;
         END IF;
       END IF;
     END IF;
     IF bPartition THEN
 
 		  SELECT count(*) INTO v_cnt1 FROM information_schema.tables t WHERE EXISTS (SELECT REGEXP_MATCHES(s.table_name, '([A-Z]+)','g') FROM information_schema.tables s
 		  WHERE t.table_schema=s.table_schema AND t.table_name=s.table_name AND t.table_schema = in_schema AND t.table_name = in_table AND t.table_type = 'BASE TABLE');
 
 
       SELECT COUNT(*) INTO v_cnt2 FROM pg_get_keywords() WHERE word = in_table AND catcode = 'R';
 
       IF bInheritance THEN
         IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
           v_table_ddl := 'CREATE TABLE ' || in_schema || '."' || in_table || '"( '|| E'\n';
         ELSE
           v_table_ddl := 'CREATE TABLE ' || in_schema || '.' || in_table || '( '|| E'\n';
         END IF;
 
 
       ELSE
         IF v_relopts <> '' THEN
           IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
             v_table_ddl := 'CREATE TABLE ' || in_schema || '."' || in_table || '" PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || v_relopts || ' ' || v_tablespace || '; ' || E'\n';
 				  ELSE
 				    v_table_ddl := 'CREATE TABLE ' || in_schema || '.' || in_table || ' PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || v_relopts || ' ' || v_tablespace || '; ' || E'\n';
 				  END IF;
         ELSE
           IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
             v_table_ddl := 'CREATE TABLE ' || in_schema || '."' || in_table || '" PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || ' ' || v_tablespace || '; ' || E'\n';
 				  ELSE
 				    v_table_ddl := 'CREATE TABLE ' || in_schema || '.' || in_table || ' PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || ' ' || v_tablespace || '; ' || E'\n';
 				  END IF;
         END IF;
 
       END IF;
     END IF;
 	  IF bVerbose THEN RAISE NOTICE '(1)tabledef so far: %', v_table_ddl; END IF;
 
     IF NOT bPartition THEN
 
       select c.relpersistence into v_persist from pg_class c, pg_namespace n where n.nspname = in_schema and n.oid = c.relnamespace and c.relname = in_table and c.relkind = 'r';
       IF v_persist = 'u' THEN
         v_temp := 'UNLOGGED';
       ELSIF v_persist = 't' THEN
         v_temp := 'TEMPORARY';
       ELSE
         v_temp := '';
       END IF;
     END IF;
 
 
     IF NOT bPartition THEN
 
       SELECT count(*) INTO v_cnt1 FROM information_schema.tables t WHERE EXISTS (SELECT REGEXP_MATCHES(s.table_name, '([A-Z]+)','g') FROM information_schema.tables s
       WHERE t.table_schema=s.table_schema AND t.table_name=s.table_name AND t.table_schema = in_schema AND t.table_name = in_table AND t.table_type = 'BASE TABLE');
       IF v_cnt1 > 0 THEN
         v_table_ddl := 'CREATE ' || v_temp || ' TABLE ' || in_schema || '."' || in_table || '" (' || E'\n';
       ELSE
         v_table_ddl := 'CREATE ' || v_temp || ' TABLE ' || in_schema || '.' || in_table || ' (' || E'\n';
       END IF;
     END IF;
 
     IF NOT bPartition THEN
       FOR v_colrec IN
         SELECT c.column_name, c.data_type, c.udt_name, c.udt_schema, c.character_maximum_length, c.is_nullable, c.column_default, c.numeric_precision, c.numeric_scale, c.is_identity, c.identity_generation, c.is_generated, c.generation_expression
         FROM information_schema.columns c WHERE (table_schema, table_name) = (in_schema, in_table) ORDER BY ordinal_position
       LOOP
          IF bVerbose THEN RAISE NOTICE '(col loop) name=%  type=%  udt_name=%  default=%  is_generated=%  gen_expr=%', v_colrec.column_name, v_colrec.data_type, v_colrec.udt_name, v_colrec.column_default, v_colrec.is_generated, v_colrec.generation_expression; END IF;
 
          SELECT CASE WHEN pg_get_serial_sequence(quote_ident(in_schema) || '.' || quote_ident(in_table), v_colrec.column_name) IS NOT NULL THEN True ELSE False END into bSerial;
          IF bVerbose THEN
 
            SELECT pg_get_serial_sequence(quote_ident(in_schema) || '.' || quote_ident(in_table), v_colrec.column_name) into v_temp;
            IF v_temp IS NULL THEN v_temp = 'NA'; END IF;
            SELECT pg_get_coldef(in_schema, in_table,v_colrec.column_name) INTO v_diag1;
            RAISE NOTICE 'DEBUG table: %  Column: %  datatype: %  Serial=%  serialval=%  coldef=%', v_qualified, v_colrec.column_name, v_colrec.data_type, bSerial, v_temp, v_diag1;
            RAISE NOTICE 'DEBUG tabledef: %', v_table_ddl;
          END IF;
 
 
          SELECT COUNT(*) INTO v_cnt1 FROM information_schema.columns t WHERE EXISTS (SELECT REGEXP_MATCHES(s.column_name, '([A-Z]+)','g') FROM information_schema.columns s
          WHERE t.table_schema=s.table_schema and t.table_name=s.table_name and t.column_name=s.column_name AND t.table_schema = quote_ident(in_schema) AND column_name = v_colrec.column_name);
 
          SELECT COUNT(*) INTO v_cnt2 FROM pg_get_keywords() WHERE word = v_colrec.column_name AND catcode = 'R';
 
          IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
            v_table_ddl := v_table_ddl || '  "' || v_colrec.column_name || '" ';
          ELSE
            v_table_ddl := v_table_ddl || '  ' || v_colrec.column_name || ' ';
          END IF;
 
          IF v_colrec.is_generated = 'ALWAYS' and v_colrec.generation_expression IS NOT NULL THEN
 
              v_temp = v_colrec.data_type || ' GENERATED ALWAYS AS (' || v_colrec.generation_expression || ') STORED ';
          ELSEIF v_colrec.udt_name in ('geometry', 'box2d', 'box2df', 'box3d', 'geography', 'geometry_dump', 'gidx', 'spheroid', 'valid_detail') THEN
 		         v_temp = v_colrec.udt_name;
 		     ELSEIF v_colrec.data_type = 'USER-DEFINED' THEN
 		         v_temp = v_colrec.udt_schema || '.' || v_colrec.udt_name;
 		     ELSEIF v_colrec.data_type = 'ARRAY' THEN
 
 		         v_temp = pg_get_coldef(in_schema, in_table,v_colrec.column_name);
 
 		     ELSEIF pg_get_serial_sequence(quote_ident(in_schema) || '.' || quote_ident(in_table), v_colrec.column_name) IS NOT NULL THEN
 		         -- Issue#8 fix: handle serial. Note: NOT NULL is implied so no need to declare it explicitly
 		         v_temp = pg_get_coldef(in_schema, in_table,v_colrec.column_name);
 		     ELSE
 		         v_temp = v_colrec.data_type;
          END IF;
 
 
 
 		     IF v_colrec.is_identity = 'YES' THEN
 		         IF v_colrec.identity_generation = 'ALWAYS' THEN
 		             v_temp = v_temp || ' GENERATED ALWAYS AS IDENTITY NOT NULL';
 		         ELSE
 		             v_temp = v_temp || ' GENERATED BY DEFAULT AS IDENTITY NOT NULL';
 		         END IF;
          ELSEIF v_colrec.character_maximum_length IS NOT NULL THEN
              v_temp = v_temp || ('(' || v_colrec.character_maximum_length || ')');
          ELSEIF v_colrec.numeric_precision > 0 AND v_colrec.numeric_scale > 0 THEN
              v_temp = v_temp || '(' || v_colrec.numeric_precision || ',' || v_colrec.numeric_scale || ')';
          END IF;
 
 
          IF bSerial THEN
              v_temp = v_temp || ' NOT NULL';
          ELSEIF v_colrec.is_nullable = 'NO' THEN
              v_temp = v_temp || ' NOT NULL';
          ELSEIF v_colrec.is_nullable = 'YES' THEN
              v_temp = v_temp || ' NULL';
          END IF;
 
 
          IF v_colrec.column_default IS NOT null AND NOT bSerial THEN
 
              v_temp = v_temp || (' DEFAULT ' || v_colrec.column_default);
          END IF;
          v_temp = v_temp || ',' || E'\n';
 
          v_table_ddl := v_table_ddl || v_temp;
 
 
       END LOOP;
     END IF;
     IF bVerbose THEN RAISE NOTICE '(2)tabledef so far: %', v_table_ddl; END IF;
 
     IF v_pgversion < 110000 THEN
       FOR v_constraintrec IN
         SELECT con.conname as constraint_name, con.contype as constraint_type,
           CASE
             WHEN con.contype = 'p' THEN 1 -- primary key constraint
             WHEN con.contype = 'u' THEN 2 -- unique constraint
             WHEN con.contype = 'f' THEN 3 -- foreign key constraint
             WHEN con.contype = 'c' THEN 4
             ELSE 5
           END as type_rank,
           pg_get_constraintdef(con.oid) as constraint_definition
         FROM pg_catalog.pg_constraint con JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
         WHERE nsp.nspname = in_schema AND rel.relname = in_table ORDER BY type_rank
       LOOP
         v_constraint_name := v_constraintrec.constraint_name;
         v_constraint_def  := v_constraintrec.constraint_definition;
         IF v_constraintrec.type_rank = 1 THEN
             IF pkcnt = 0 OR pktype = 'PKEY_INTERNAL' THEN
 
                 v_constraint_name := v_constraintrec.constraint_name;
                 v_constraint_def  := v_constraintrec.constraint_definition;
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
 
               SELECT 'ALTER TABLE ONLY ' || in_schema || '.' || c.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_pkey_def
               FROM pg_catalog.pg_constraint r, pg_class c, pg_namespace n where r.conrelid = c.oid and  r.contype = 'p' and n.oid = r.connamespace and n.nspname = in_schema AND c.relname = in_table and r.conname = v_constraint_name;
             END IF;
             IF bPartition THEN
               continue;
             END IF;
         ELSIF v_constraintrec.type_rank = 3 THEN
 
             IF fktype = 'FKEYS_NONE' THEN
 
                 continue;
             ELSIF fkcnt = 0 OR fktype = 'FKEYS_INTERNAL' THEN
 
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
 
                 SELECT 'ALTER TABLE ONLY ' || n.nspname || '.' || c2.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_fkey_def
   			        FROM pg_constraint r, pg_class c1, pg_namespace n, pg_class c2 where r.conrelid = c1.oid and  r.contype = 'f' and n.nspname = in_schema and n.oid = r.connamespace and r.conrelid = c2.oid and c2.relname = in_table;
                 v_fkey_defs = v_fkey_defs || v_fkey_def || E'\n';
             END IF;
         ELSE
 
             v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
               || 'CONSTRAINT' || ' '
               || v_constraint_name || ' '
               || v_constraint_def
               || ',' || E'\n';
         END IF;
         if bVerbose THEN RAISE NOTICE 'DEBUG4: constraint name=% constraint_def=%', v_constraint_name,v_constraint_def; END IF;
         constraintarr := constraintarr || v_constraintrec.constraint_name:: text;
 
       END LOOP;
     ELSE
       FOR v_constraintrec IN
         SELECT con.conname as constraint_name, con.contype as constraint_type,
           CASE
             WHEN con.contype = 'p' THEN 1 -- primary key constraint
             WHEN con.contype = 'u' THEN 2 -- unique constraint
             WHEN con.contype = 'f' THEN 3 -- foreign key constraint
             WHEN con.contype = 'c' THEN 4
             ELSE 5
           END as type_rank,
           pg_get_constraintdef(con.oid) as constraint_definition
         FROM pg_catalog.pg_constraint con JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
         WHERE nsp.nspname = in_schema AND rel.relname = in_table
               --Issue#13 added this condition:
               AND con.conparentid = 0
               ORDER BY type_rank
       LOOP
         v_constraint_name := v_constraintrec.constraint_name;
         v_constraint_def  := v_constraintrec.constraint_definition;
         IF v_constraintrec.type_rank = 1 THEN
             IF pkcnt = 0 OR pktype = 'PKEY_INTERNAL' THEN
                 -- internal def
                 v_constraint_name := v_constraintrec.constraint_name;
                 v_constraint_def  := v_constraintrec.constraint_definition;
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
               SELECT 'ALTER TABLE ONLY ' || in_schema || '.' || c.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_pkey_def
               FROM pg_catalog.pg_constraint r, pg_class c, pg_namespace n where r.conrelid = c.oid and  r.contype = 'p' and n.oid = r.connamespace and n.nspname = in_schema AND c.relname = in_table;
             END IF;
             IF bPartition THEN
               continue;
             END IF;
         ELSIF v_constraintrec.type_rank = 3 THEN
 
             IF fktype = 'FKEYS_NONE' THEN
                 -- skip
                 continue;
             ELSIF fkcnt = 0 OR fktype = 'FKEYS_INTERNAL' THEN
                 -- internal def
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
 
                 SELECT 'ALTER TABLE ONLY ' || n.nspname || '.' || c2.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_fkey_def
   			        FROM pg_constraint r, pg_class c1, pg_namespace n, pg_class c2 where r.conrelid = c1.oid and  r.contype = 'f' and n.nspname = in_schema and n.oid = r.connamespace and r.conrelid = c2.oid and c2.relname = in_table and
   			        r.conname = v_constraint_name and r.conparentid = 0;
                 v_fkey_defs = v_fkey_defs || v_fkey_def || E'\n';
             END IF;
         ELSE
 
             v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
               || 'CONSTRAINT' || ' '
               || v_constraint_name || ' '
               || v_constraint_def
               || ',' || E'\n';
         END IF;
         if bVerbose THEN RAISE NOTICE 'DEBUG4: constraint name=% constraint_def=%', v_constraint_name,v_constraint_def; END IF;
         constraintarr := constraintarr || v_constraintrec.constraint_name:: text;
 
        END LOOP;
     END IF;
 
 
     select substring(v_table_ddl, length(v_table_ddl) - 1, 1) INTO v_temp;
     IF v_temp = ',' THEN
         v_table_ddl = substr(v_table_ddl, 0, length(v_table_ddl) - 1) || E'\n';
     END IF;
     IF bVerbose THEN RAISE NOTICE '(3)tabledef so far: %', trim(v_table_ddl); END IF;
 
 
     IF bVerbose THEN RAISE NOTICE '(4)tabledef so far: %', v_table_ddl; END IF;
 
 
     IF bPartition and bInheritance THEN
 
       IF v_parent_schema = '' OR v_parent_schema IS NULL THEN v_parent_schema = in_schema; END IF;
       v_table_ddl := v_table_ddl || ') INHERITS (' || v_parent_schema || '.' || v_parent || ') ' || E'\n' || v_relopts || ' ' || v_tablespace || ';' || E'\n';
     END IF;
 
     IF v_pgversion >= 100000 AND NOT bPartition and NOT bInheritance THEN
       SELECT pg_get_partkeydef(c1.oid) as partition_key INTO v_partition_key FROM pg_class c1 JOIN pg_namespace n ON (n.oid = c1.relnamespace) LEFT JOIN pg_partitioned_table p ON (c1.oid = p.partrelid)
       WHERE n.nspname = in_schema and n.oid = c1.relnamespace and c1.relname = in_table and c1.relkind = 'p';
 
       IF v_partition_key IS NOT NULL AND v_partition_key <> '' THEN
         v_table_ddl := v_table_ddl || ') PARTITION BY ' || v_partition_key || ';' || E'\n';
       ELSEIF v_relopts <> '' THEN
         v_table_ddl := v_table_ddl || ') ' || v_relopts || ' ' || v_tablespace || ';' || E'\n';
       ELSE
 
         v_table_ddl := v_table_ddl || ') ' || v_tablespace || ';' || E'\n';
       END IF;
     END IF;
 
     IF bVerbose THEN RAISE NOTICE '(5)tabledef so far: %', v_table_ddl; END IF;
 
     IF v_pkey_def <> '' THEN
         v_table_ddl := v_table_ddl || v_pkey_def || E'\n';
     END IF;
 
 
     IF v_fkey_defs <> '' THEN
 	         v_table_ddl := v_table_ddl || v_fkey_defs || E'\n';
     END IF;
 
     IF bVerbose THEN RAISE NOTICE '(6)tabledef so far: %', v_table_ddl; END IF;
 
     FOR v_indexrec IN
       SELECT indexdef, COALESCE(tablespace, 'pg_default') as tablespace, indexname FROM pg_indexes WHERE (schemaname, tablename) = (in_schema, in_table)
     LOOP
 
       bSkip = False;
       FOREACH constraintelement IN ARRAY constraintarr
       LOOP
          IF constraintelement = v_indexrec.indexname THEN
              -- RAISE NOTICE 'DEBUG7: skipping index, %', v_indexrec.indexname;
              bSkip = True;
              EXIT;
          END IF;
       END LOOP;
       if bSkip THEN CONTINUE; END IF;
 
       v_indexrec.indexdef := REPLACE(v_indexrec.indexdef, 'CREATE INDEX', 'CREATE INDEX IF NOT EXISTS');
       v_indexrec.indexdef := REPLACE(v_indexrec.indexdef, 'CREATE UNIQUE INDEX', 'CREATE UNIQUE INDEX IF NOT EXISTS');
       IF v_partition_key IS NOT NULL AND v_partition_key <> '' THEN
           v_table_ddl := v_table_ddl || v_indexrec.indexdef || ';' || E'\n';
       ELSE
 					select CASE WHEN i.indpred IS NOT NULL THEN True ELSE False END INTO v_partial
 					FROM pg_index i JOIN pg_class c1 ON (i.indexrelid = c1.oid) JOIN pg_class c2 ON (i.indrelid = c2.oid)
 					WHERE c1.relnamespace::regnamespace::text = in_schema AND c2.relnamespace::regnamespace::text = in_schema AND c2.relname = in_table AND c1.relname = v_indexrec.indexname;
           IF v_partial THEN
               -- Put tablespace def before WHERE CLAUSE
               v_temp = v_indexrec.indexdef;
               v_pos = POSITION(' WHERE ' IN v_temp);
               v_temp2 = SUBSTRING(v_temp, v_pos);
               v_temp  = SUBSTRING(v_temp, 1, v_pos);
               v_table_ddl := v_table_ddl || v_temp || ' TABLESPACE ' || v_indexrec.tablespace || v_temp2 || ';' || E'\n';
           ELSE
               v_table_ddl := v_table_ddl || v_indexrec.indexdef || ' TABLESPACE ' || v_indexrec.tablespace || ';' || E'\n';
           END IF;
       END IF;
 
     END LOOP;
     IF bVerbose THEN RAISE NOTICE '(7)tabledef so far: %', v_table_ddl; END IF;
 
     -- Issue#20: added logic for table and column comments
     IF  cmtcnt > 0 THEN
         FOR v_rec IN
           SELECT c.relname, 'COMMENT ON ' || CASE WHEN c.relkind in ('r','p') AND a.attname IS NULL THEN 'TABLE ' WHEN c.relkind in ('r','p') AND a.attname IS NOT NULL THEN 'COLUMN ' WHEN c.relkind = 'f' THEN 'FOREIGN TABLE '
                  WHEN c.relkind = 'm' THEN 'MATERIALIZED VIEW ' WHEN c.relkind = 'v' THEN 'VIEW ' WHEN c.relkind = 'i' THEN 'INDEX ' WHEN c.relkind = 'S' THEN 'SEQUENCE ' ELSE 'XX' END || n.nspname || '.' ||
                  CASE WHEN c.relkind in ('r','p') AND a.attname IS NOT NULL THEN quote_ident(c.relname) || '.' || a.attname ELSE quote_ident(c.relname) END || ' IS '   || quote_literal(d.description) || ';' as ddl
 	   	    FROM pg_class c JOIN pg_namespace n ON (n.oid = c.relnamespace) LEFT JOIN pg_description d ON (c.oid = d.objoid) LEFT JOIN pg_attribute a ON (c.oid = a.attrelid AND a.attnum > 0 and a.attnum = d.objsubid)
 	   	    WHERE d.description IS NOT NULL AND n.nspname = in_schema AND c.relname = in_table ORDER BY 2 desc, ddl
         LOOP
             --RAISE NOTICE 'comments:%', v_rec.ddl;
             v_table_ddl = v_table_ddl || v_rec.ddl || E'\n';
         END LOOP;
     END IF;
     IF bVerbose THEN RAISE NOTICE '(8)tabledef so far: %', v_table_ddl; END IF;
 
     IF trigtype = 'INCLUDE_TRIGGERS' THEN
 	    -- Issue#14: handle multiple triggers for a table
       FOR v_trigrec IN
           select pg_get_triggerdef(t.oid, True) || ';' as triggerdef FROM pg_trigger t, pg_class c, pg_namespace n
           WHERE n.nspname = in_schema and n.oid = c.relnamespace and c.relname = in_table and c.relkind = 'r' and t.tgrelid = c.oid and NOT t.tgisinternal
       LOOP
           v_table_ddl := v_table_ddl || v_trigrec.triggerdef;
           v_table_ddl := v_table_ddl || E'\n';
           IF bVerbose THEN RAISE NOTICE 'triggerdef = %', v_trigrec.triggerdef; END IF;
       END LOOP;
     END IF;
 
     IF bVerbose THEN RAISE NOTICE '(9)tabledef so far: %', v_table_ddl; END IF;
     v_table_ddl := v_table_ddl || E'\n';
     IF bVerbose THEN RAISE NOTICE '(10)tabledef so far: %', v_table_ddl; END IF;
     IF search_path_old = '' THEN
       SELECT set_config('search_path', '', false) into v_temp;
     ELSE
       EXECUTE 'SET search_path = ' || search_path_old;
     END IF;
 
     RETURN v_table_ddl;
 
     EXCEPTION
     WHEN others THEN
     BEGIN
       GET STACKED DIAGNOSTICS v_diag1 = MESSAGE_TEXT, v_diag2 = PG_EXCEPTION_DETAIL, v_diag3 = PG_EXCEPTION_HINT, v_diag4 = RETURNED_SQLSTATE, v_diag5 = PG_CONTEXT, v_diag6 = PG_EXCEPTION_CONTEXT;
       v_ret := 'line=' || v_diag6 || '. '|| v_diag4 || '. ' || v_diag1;
       RAISE EXCEPTION '%', v_ret;
        RETURN '';
     END;
 
   END;
  $$//
DELIMITER ;

-- Dumping structure for table account.devices
CREATE TABLE IF NOT EXISTS "devices" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"name" TEXT NULL DEFAULT NULL,
	"fingerprint" TEXT NULL DEFAULT NULL,
	"trusted" BOOLEAN NOT NULL DEFAULT false,
	"last_used_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	KEY "idx_devices_account" ("account_id"),
	KEY "idx_account_devices_account_id" ("account_id"),
	CONSTRAINT "devices_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table account.devices: -1 rows
/*!40000 ALTER TABLE "devices" DISABLE KEYS */;
/*!40000 ALTER TABLE "devices" ENABLE KEYS */;

-- Dumping structure for table account.profiles
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"display_name" TEXT NOT NULL,
	"avatar_url" TEXT NULL DEFAULT NULL,
	"phone" TEXT NULL DEFAULT NULL,
	"birthday" DATE NULL DEFAULT NULL,
	"bio" TEXT NULL DEFAULT NULL,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	UNIQUE "profiles_account_id_key" ("account_id"),
	CONSTRAINT "profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table account.profiles: -1 rows
/*!40000 ALTER TABLE "profiles" DISABLE KEYS */;
-- Dumping structure for table account.security
CREATE TABLE IF NOT EXISTS "security" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"security_level" SMALLINT NOT NULL DEFAULT 0,
	"otp_enabled" BOOLEAN NOT NULL DEFAULT false,
	"otp_secret" BYTEA NULL DEFAULT NULL,
	"otp_verified_at" TIMESTAMPTZ NULL DEFAULT NULL,
	"require_trusted_device" BOOLEAN NOT NULL DEFAULT false,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	UNIQUE "security_account_id_key" ("account_id"),
	CONSTRAINT "security_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table account.security: -1 rows
/*!40000 ALTER TABLE "security" DISABLE KEYS */;
/*!40000 ALTER TABLE "security" ENABLE KEYS */;

-- Dumping structure for table account.sessions
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"ip_address" TEXT NULL DEFAULT NULL,
	"user_agent" TEXT NULL DEFAULT NULL,
	"last_activity_at" TIMESTAMPTZ NULL DEFAULT now(),
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"expires_at" TIMESTAMPTZ NULL DEFAULT NULL,
	"revoked_at" TIMESTAMPTZ NULL DEFAULT NULL,
	PRIMARY KEY ("id"),
	KEY "idx_sessions_account" ("account_id"),
	KEY "idx_account_sessions_account_id" ("account_id"),
	KEY "idx_account_sessions_revoked" ("account_id", "revoked_at"),
	CONSTRAINT "sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table account.sessions: -1 rows
/*!40000 ALTER TABLE "sessions" DISABLE KEYS */;
/*!40000 ALTER TABLE "sessions" ENABLE KEYS */;

-- Dumping structure for table account.settings
CREATE TABLE IF NOT EXISTS "settings" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"key" TEXT NOT NULL,
	"value" TEXT NOT NULL,
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	UNIQUE "settings_account_id_key_key" ("account_id", "key"),
	KEY "idx_settings_account" ("account_id"),
	KEY "idx_account_settings_account_id" ("account_id"),
	CONSTRAINT "settings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table account.settings: -1 rows
/*!40000 ALTER TABLE "settings" DISABLE KEYS */;
-- Dumping structure for table account.statuses
CREATE TABLE IF NOT EXISTS "statuses" (
	"code" VARCHAR(20) NOT NULL,
	"description" TEXT NULL DEFAULT NULL,
	"is_active" BOOLEAN NULL DEFAULT true,
	PRIMARY KEY ("code")
);

-- Dumping data for table account.statuses: -1 rows
/*!40000 ALTER TABLE "statuses" DISABLE KEYS */;
-- Dumping structure for table account.users
CREATE TABLE IF NOT EXISTS "users" (
	"id" SERIAL NOT NULL,
	"email" TEXT NOT NULL,
	"password" TEXT NOT NULL,
	"status" VARCHAR(20) NOT NULL DEFAULT 'active',
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	UNIQUE "users_email_key" ("email"),
	KEY "idx_accounts_email" ("email"),
	KEY "idx_account_users_email" ("email"),
	KEY "idx_account_users_created_at" ("created_at"),
	CONSTRAINT "users_status_fkey" FOREIGN KEY ("status") REFERENCES "statuses" ("code") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Dumping data for table account.users: 1 rows
/*!40000 ALTER TABLE "users" DISABLE KEYS */;
-- Dumping structure for table audit.logs
CREATE TABLE IF NOT EXISTS "logs" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NULL DEFAULT NULL,
	"action" TEXT NOT NULL,
	"resource_type" TEXT NULL DEFAULT NULL,
	"resource_id" TEXT NULL DEFAULT NULL,
	"details" JSONB NULL DEFAULT NULL,
	"ip_address" TEXT NULL DEFAULT NULL,
	"user_agent" TEXT NULL DEFAULT NULL,
	"created_at" TIMESTAMPTZ NULL DEFAULT now(),
	CONSTRAINT "logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL
);

-- Dumping data for table audit.logs: -1 rows
/*!40000 ALTER TABLE "logs" DISABLE KEYS */;
-- Dumping structure for table note.item
CREATE TABLE IF NOT EXISTS "item" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"account_id" SERIAL NOT NULL,
	"title" VARCHAR(200) NULL DEFAULT NULL,
	"content" TEXT NOT NULL,
	"is_encrypted" BOOLEAN NOT NULL DEFAULT false,
	"password" BYTEA NULL DEFAULT NULL,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "color" TEXT,
	CONSTRAINT "fk_note_item_account" FOREIGN KEY ("account_id") REFERENCES "account"."users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table note.item: -1 rows
/*!40000 ALTER TABLE "item" DISABLE KEYS */;
/*!40000 ALTER TABLE "item" ENABLE KEYS */;

-- Dumping structure for table note.share
CREATE TABLE IF NOT EXISTS "share" (
	"id" SERIAL NOT NULL,
	"note_id" UUID NOT NULL,
	"share_token" UUID NOT NULL DEFAULT gen_random_uuid(),
	"password_hash" TEXT NULL DEFAULT NULL,
	"expired_at" TIMESTAMPTZ NULL DEFAULT NULL,
	"max_views" INTEGER NULL DEFAULT NULL,
	"view_count" INTEGER NOT NULL DEFAULT 0,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"revoked_at" TIMESTAMPTZ NULL DEFAULT NULL,
	CONSTRAINT "share_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "item" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table note.share: -1 rows
/*!40000 ALTER TABLE "share" DISABLE KEYS */;
/*!40000 ALTER TABLE "share" ENABLE KEYS */;

-- Dumping structure for table notification.items
CREATE TABLE IF NOT EXISTS "items" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"type" UNKNOWN NOT NULL DEFAULT 'info',
	"title" TEXT NOT NULL,
	"content" TEXT NULL DEFAULT NULL,
	"resource_type" TEXT NULL DEFAULT NULL,
	"resource_id" TEXT NULL DEFAULT NULL,
	"is_read" BOOLEAN NOT NULL DEFAULT false,
	"read_at" TIMESTAMPTZ NULL DEFAULT NULL,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT "items_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table notification.items: -1 rows
/*!40000 ALTER TABLE "items" DISABLE KEYS */;
/*!40000 ALTER TABLE "items" ENABLE KEYS */;

-- Dumping structure for function public.armor
DELIMITER //
CREATE FUNCTION "armor"() RETURNS TEXT AS $$ pg_armor $$//
DELIMITER ;

-- Dumping structure for function public.armor
DELIMITER //
CREATE FUNCTION "armor"() RETURNS TEXT AS $$ pg_armor $$//
DELIMITER ;

-- Dumping structure for function public.crypt
DELIMITER //
CREATE FUNCTION "crypt"() RETURNS TEXT AS $$ pg_crypt $$//
DELIMITER ;

-- Dumping structure for function public.dearmor
DELIMITER //
CREATE FUNCTION "dearmor"() RETURNS BYTEA AS $$ pg_dearmor $$//
DELIMITER ;

-- Dumping structure for function public.decrypt
DELIMITER //
CREATE FUNCTION "decrypt"() RETURNS BYTEA AS $$ pg_decrypt $$//
DELIMITER ;

-- Dumping structure for function public.decrypt_iv
DELIMITER //
CREATE FUNCTION "decrypt_iv"() RETURNS BYTEA AS $$ pg_decrypt_iv $$//
DELIMITER ;

-- Dumping structure for function public.digest
DELIMITER //
CREATE FUNCTION "digest"() RETURNS BYTEA AS $$ pg_digest $$//
DELIMITER ;

-- Dumping structure for function public.digest
DELIMITER //
CREATE FUNCTION "digest"() RETURNS BYTEA AS $$ pg_digest $$//
DELIMITER ;

-- Dumping structure for function public.encrypt
DELIMITER //
CREATE FUNCTION "encrypt"() RETURNS BYTEA AS $$ pg_encrypt $$//
DELIMITER ;

-- Dumping structure for function public.encrypt_iv
DELIMITER //
CREATE FUNCTION "encrypt_iv"() RETURNS BYTEA AS $$ pg_encrypt_iv $$//
DELIMITER ;

-- Dumping structure for function public.gen_random_bytes
DELIMITER //
CREATE FUNCTION "gen_random_bytes"() RETURNS BYTEA AS $$ pg_random_bytes $$//
DELIMITER ;

-- Dumping structure for function public.gen_random_uuid
DELIMITER //
CREATE FUNCTION "gen_random_uuid"() RETURNS UUID AS $$ pg_random_uuid $$//
DELIMITER ;

-- Dumping structure for function public.gen_salt
DELIMITER //
CREATE FUNCTION "gen_salt"() RETURNS TEXT AS $$ pg_gen_salt_rounds $$//
DELIMITER ;

-- Dumping structure for function public.gen_salt
DELIMITER //
CREATE FUNCTION "gen_salt"() RETURNS TEXT AS $$ pg_gen_salt $$//
DELIMITER ;

-- Dumping structure for function public.hmac
DELIMITER //
CREATE FUNCTION "hmac"() RETURNS BYTEA AS $$ pg_hmac $$//
DELIMITER ;

-- Dumping structure for function public.hmac
DELIMITER //
CREATE FUNCTION "hmac"() RETURNS BYTEA AS $$ pg_hmac $$//
DELIMITER ;

-- Dumping structure for function public.pgp_armor_headers
DELIMITER //
CREATE FUNCTION "pgp_armor_headers"("" TEXT, key , value ) RETURNS UNKNOWN AS $$ pgp_armor_headers $$//
DELIMITER ;

-- Dumping structure for function public.pgp_key_id
DELIMITER //
CREATE FUNCTION "pgp_key_id"() RETURNS TEXT AS $$ pgp_key_id_w $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_decrypt
DELIMITER //
CREATE FUNCTION "pgp_pub_decrypt"() RETURNS TEXT AS $$ pgp_pub_decrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_decrypt
DELIMITER //
CREATE FUNCTION "pgp_pub_decrypt"() RETURNS TEXT AS $$ pgp_pub_decrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_decrypt
DELIMITER //
CREATE FUNCTION "pgp_pub_decrypt"() RETURNS TEXT AS $$ pgp_pub_decrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_decrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_pub_decrypt_bytea"() RETURNS BYTEA AS $$ pgp_pub_decrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_decrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_pub_decrypt_bytea"() RETURNS BYTEA AS $$ pgp_pub_decrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_decrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_pub_decrypt_bytea"() RETURNS BYTEA AS $$ pgp_pub_decrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_encrypt
DELIMITER //
CREATE FUNCTION "pgp_pub_encrypt"() RETURNS BYTEA AS $$ pgp_pub_encrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_encrypt
DELIMITER //
CREATE FUNCTION "pgp_pub_encrypt"() RETURNS BYTEA AS $$ pgp_pub_encrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_encrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_pub_encrypt_bytea"() RETURNS BYTEA AS $$ pgp_pub_encrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_pub_encrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_pub_encrypt_bytea"() RETURNS BYTEA AS $$ pgp_pub_encrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_decrypt
DELIMITER //
CREATE FUNCTION "pgp_sym_decrypt"() RETURNS TEXT AS $$ pgp_sym_decrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_decrypt
DELIMITER //
CREATE FUNCTION "pgp_sym_decrypt"() RETURNS TEXT AS $$ pgp_sym_decrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_decrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_sym_decrypt_bytea"() RETURNS BYTEA AS $$ pgp_sym_decrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_decrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_sym_decrypt_bytea"() RETURNS BYTEA AS $$ pgp_sym_decrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_encrypt
DELIMITER //
CREATE FUNCTION "pgp_sym_encrypt"() RETURNS BYTEA AS $$ pgp_sym_encrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_encrypt
DELIMITER //
CREATE FUNCTION "pgp_sym_encrypt"() RETURNS BYTEA AS $$ pgp_sym_encrypt_text $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_encrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_sym_encrypt_bytea"() RETURNS BYTEA AS $$ pgp_sym_encrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function public.pgp_sym_encrypt_bytea
DELIMITER //
CREATE FUNCTION "pgp_sym_encrypt_bytea"() RETURNS BYTEA AS $$ pgp_sym_encrypt_bytea $$//
DELIMITER ;

-- Dumping structure for function vault.pg_get_coldef
DELIMITER //
CREATE FUNCTION "pg_get_coldef"(in_schema TEXT, in_table TEXT, in_column TEXT, oldway BOOLEAN) RETURNS TEXT AS $$ 
 DECLARE
 v_coldef     text;
 v_dt1        text;
 v_dt2        text;
 v_dt3        text;
 v_nullable   boolean;
 v_position   int;
 v_identity   text;
 v_generated  text;
 v_hasdflt    boolean;
 v_dfltexpr   text;
 
 BEGIN
   IF oldway THEN
     SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) INTO v_coldef FROM pg_namespace n, pg_class c, pg_attribute a, pg_type t
     WHERE n.nspname = in_schema AND n.oid = c.relnamespace AND c.relname = in_table AND a.attname = in_column and a.attnum > 0 AND a.attrelid = c.oid AND a.atttypid = t.oid ORDER BY a.attnum;
     -- RAISE NOTICE 'DEBUG: oldway=%',v_coldef;
   ELSE
 
     SELECT CASE WHEN a.atttypid = ANY ('{int,int8,int2}'::regtype[]) AND EXISTS (SELECT FROM pg_attrdef ad WHERE ad.adrelid = a.attrelid AND ad.adnum   = a.attnum AND
 	  pg_get_expr(ad.adbin, ad.adrelid) = 'nextval(''' || (pg_get_serial_sequence (a.attrelid::regclass::text, a.attname))::regclass || '''::regclass)') THEN CASE a.atttypid
 	  WHEN 'int'::regtype  THEN 'serial' WHEN 'int8'::regtype THEN 'bigserial' WHEN 'int2'::regtype THEN 'smallserial' END ELSE format_type(a.atttypid, a.atttypmod) END AS data_type
 	  INTO v_coldef FROM pg_namespace n, pg_class c, pg_attribute a, pg_type t
 	  WHERE n.nspname = in_schema AND n.oid = c.relnamespace AND c.relname = in_table AND a.attname = in_column and a.attnum > 0 AND a.attrelid = c.oid AND a.atttypid = t.oid ORDER BY a.attnum;
 
 
 
   END IF;
   RETURN v_coldef;
 END;
  $$//
DELIMITER ;

-- Dumping structure for function vault.pg_get_tabledef
DELIMITER //
CREATE FUNCTION "pg_get_tabledef"(in_schema VARCHAR, in_table VARCHAR, _verbose BOOLEAN, arr UNKNOWN) RETURNS TEXT AS $$ 
   DECLARE
     v_qualified text := '';
     v_table_ddl text;
     v_table_oid int;
     v_colrec record;
     v_constraintrec record;
     v_trigrec       record;
     v_indexrec record;
     v_rec           record;
     v_constraint_name text;
     v_constraint_def  text;
     v_pkey_def        text := '';
     v_fkey_def        text := '';
     v_fkey_defs       text := '';
     v_trigger text := '';
     v_partition_key text := '';
     v_partbound text;
     v_parent text;
     v_parent_schema text;
     v_persist text;
     v_temp  text := '';
     v_temp2 text;
     v_relopts text;
     v_tablespace text;
     v_pgversion int;
     bSerial boolean;
     bPartition boolean;
     bInheritance boolean;
     bRelispartition boolean;
     constraintarr text[] := '{}';
     constraintelement text;
     bSkip boolean;
 	  bVerbose boolean := False;
 	  v_cnt1   integer;
 	  v_cnt2   integer;
 	  search_path_old text := '';
 	  search_path_new text := '';
 	  v_partial    boolean;
 	  v_pos        integer;
 
 
   	pkcnt            int := 0;
   	fkcnt            int := 0;
 	  trigcnt          int := 0;
 	  cmtcnt           int := 0;
     pktype           tabledefs := 'PKEY_INTERNAL';
     fktype           tabledefs := 'FKEYS_INTERNAL';
     trigtype         tabledefs := 'NO_TRIGGERS';
     arglen           integer;
   	vargs            text;
 	  avarg            tabledefs;
 
 
     v_ret            text;
     v_diag1          text;
     v_diag2          text;
     v_diag3          text;
     v_diag4          text;
     v_diag5          text;
     v_diag6          text;
 
   BEGIN
     SET client_min_messages = 'notice';
     IF _verbose THEN bVerbose = True; END IF;
 
 
 
     arglen := array_length($4, 1);
     IF arglen IS NULL THEN
         -- nothing to do, so assume defaults
         NULL;
     ELSE
 
         IF bVerbose THEN RAISE NOTICE 'arguments=%', $4; END IF;
         FOREACH avarg IN ARRAY $4 LOOP
             IF bVerbose THEN RAISE NOTICE 'arg=%', avarg; END IF;
             IF avarg = 'FKEYS_INTERNAL' OR avarg = 'FKEYS_EXTERNAL' OR avarg = 'FKEYS_NONE' THEN
                 fkcnt = fkcnt + 1;
                 fktype = avarg;
             ELSEIF avarg = 'INCLUDE_TRIGGERS' OR avarg = 'NO_TRIGGERS' THEN
                 trigcnt = trigcnt + 1;
                 trigtype = avarg;
             ELSEIF avarg = 'PKEY_EXTERNAL' THEN
                 pkcnt = pkcnt + 1;
                 pktype = avarg;
             ELSEIF avarg = 'COMMENTS' THEN
                 cmtcnt = cmtcnt + 1;
 
             END IF;
         END LOOP;
         IF fkcnt > 1 THEN
   	        RAISE WARNING 'Only one foreign key option can be provided. You provided %', fkcnt;
 	          RETURN '';
         ELSEIF trigcnt > 1 THEN
             RAISE WARNING 'Only one trigger option can be provided. You provided %', trigcnt;
             RETURN '';
         ELSEIF pkcnt > 1 THEN
             RAISE WARNING 'Only one pkey option can be provided. You provided %', pkcnt;
             RETURN '';
         ELSEIF cmtcnt > 1 THEN
             RAISE WARNING 'Only one comments option can be provided. You provided %', cmtcnt;
             RETURN '';
 
         END IF;
     END IF;
 
     SELECT c.oid, (select setting from pg_settings where name = 'server_version_num') INTO v_table_oid, v_pgversion FROM pg_catalog.pg_class c LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind in ('r','p') AND c.relname = in_table AND n.nspname = in_schema;
 
     SELECT setting INTO search_path_old FROM pg_settings WHERE name = 'search_path';
 
     SELECT REPLACE(REPLACE(setting, '"$user"', '$user'), '$user', '"$user"') INTO search_path_old
     FROM pg_settings
     WHERE name = 'search_path';
 
     EXECUTE 'SET search_path = "public"';
     SELECT setting INTO search_path_new FROM pg_settings WHERE name = 'search_path';
 
     IF (v_table_oid IS NULL) THEN
       RAISE EXCEPTION 'table does not exist';
     END IF;
 
 
     SELECT tablespace INTO v_temp FROM pg_tables WHERE schemaname = in_schema and tablename = in_table and tablespace IS NOT NULL;
     IF v_temp IS NULL THEN
       v_tablespace := 'TABLESPACE pg_default';
     ELSE
       v_tablespace := 'TABLESPACE ' || v_temp;
     END IF;
 
 
     WITH relopts AS (SELECT unnest(c.reloptions) relopts FROM pg_class c, pg_namespace n WHERE n.nspname = in_schema and n.oid = c.relnamespace and c.relname = in_table)
     SELECT string_agg(r.relopts, ', ') as relopts INTO v_temp from relopts r;
     IF v_temp IS NULL THEN
       v_relopts := '';
     ELSE
       v_relopts := ' WITH (' || v_temp || ')';
     END IF;
 
 
     v_partbound := '';
     bPartition := False;
     bInheritance := False;
     IF v_pgversion < 100000 THEN
 
       SELECT c2.relname parent, c2.relnamespace::regnamespace INTO v_parent, v_parent_schema from pg_class c1, pg_namespace n, pg_inherits i, pg_class c2
       WHERE n.nspname = in_schema and n.oid = c1.relnamespace and c1.relname = in_table and c1.oid = i.inhrelid and i.inhparent = c2.oid and c1.relkind = 'r';
       IF (v_parent IS NOT NULL) THEN
         bPartition   := True;
         bInheritance := True;
       END IF;
     ELSE
 
       SELECT c2.relname parent, c1.relispartition, pg_get_expr(c1.relpartbound, c1.oid, true), c2.relnamespace::regnamespace INTO v_parent, bRelispartition, v_partbound, v_parent_schema from pg_class c1, pg_namespace n, pg_inherits i, pg_class c2
       WHERE n.nspname = in_schema and n.oid = c1.relnamespace and c1.relname = in_table and c1.oid = i.inhrelid and i.inhparent = c2.oid and c1.relkind = 'r';
       IF (v_parent IS NOT NULL) THEN
         bPartition   := True;
         IF bRelispartition THEN
           bInheritance := False;
         ELSE
           bInheritance := True;
         END IF;
       END IF;
     END IF;
     IF bPartition THEN
 
 		  SELECT count(*) INTO v_cnt1 FROM information_schema.tables t WHERE EXISTS (SELECT REGEXP_MATCHES(s.table_name, '([A-Z]+)','g') FROM information_schema.tables s
 		  WHERE t.table_schema=s.table_schema AND t.table_name=s.table_name AND t.table_schema = in_schema AND t.table_name = in_table AND t.table_type = 'BASE TABLE');
 
 
       SELECT COUNT(*) INTO v_cnt2 FROM pg_get_keywords() WHERE word = in_table AND catcode = 'R';
 
       IF bInheritance THEN
         IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
           v_table_ddl := 'CREATE TABLE ' || in_schema || '."' || in_table || '"( '|| E'\n';
         ELSE
           v_table_ddl := 'CREATE TABLE ' || in_schema || '.' || in_table || '( '|| E'\n';
         END IF;
 
 
       ELSE
         IF v_relopts <> '' THEN
           IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
             v_table_ddl := 'CREATE TABLE ' || in_schema || '."' || in_table || '" PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || v_relopts || ' ' || v_tablespace || '; ' || E'\n';
 				  ELSE
 				    v_table_ddl := 'CREATE TABLE ' || in_schema || '.' || in_table || ' PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || v_relopts || ' ' || v_tablespace || '; ' || E'\n';
 				  END IF;
         ELSE
           IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
             v_table_ddl := 'CREATE TABLE ' || in_schema || '."' || in_table || '" PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || ' ' || v_tablespace || '; ' || E'\n';
 				  ELSE
 				    v_table_ddl := 'CREATE TABLE ' || in_schema || '.' || in_table || ' PARTITION OF ' || in_schema || '.' || v_parent || ' ' || v_partbound || ' ' || v_tablespace || '; ' || E'\n';
 				  END IF;
         END IF;
 
       END IF;
     END IF;
 	  IF bVerbose THEN RAISE NOTICE '(1)tabledef so far: %', v_table_ddl; END IF;
 
     IF NOT bPartition THEN
 
       select c.relpersistence into v_persist from pg_class c, pg_namespace n where n.nspname = in_schema and n.oid = c.relnamespace and c.relname = in_table and c.relkind = 'r';
       IF v_persist = 'u' THEN
         v_temp := 'UNLOGGED';
       ELSIF v_persist = 't' THEN
         v_temp := 'TEMPORARY';
       ELSE
         v_temp := '';
       END IF;
     END IF;
 
 
     IF NOT bPartition THEN
 
       SELECT count(*) INTO v_cnt1 FROM information_schema.tables t WHERE EXISTS (SELECT REGEXP_MATCHES(s.table_name, '([A-Z]+)','g') FROM information_schema.tables s
       WHERE t.table_schema=s.table_schema AND t.table_name=s.table_name AND t.table_schema = in_schema AND t.table_name = in_table AND t.table_type = 'BASE TABLE');
       IF v_cnt1 > 0 THEN
         v_table_ddl := 'CREATE ' || v_temp || ' TABLE ' || in_schema || '."' || in_table || '" (' || E'\n';
       ELSE
         v_table_ddl := 'CREATE ' || v_temp || ' TABLE ' || in_schema || '.' || in_table || ' (' || E'\n';
       END IF;
     END IF;
 
     IF NOT bPartition THEN
       FOR v_colrec IN
         SELECT c.column_name, c.data_type, c.udt_name, c.udt_schema, c.character_maximum_length, c.is_nullable, c.column_default, c.numeric_precision, c.numeric_scale, c.is_identity, c.identity_generation, c.is_generated, c.generation_expression
         FROM information_schema.columns c WHERE (table_schema, table_name) = (in_schema, in_table) ORDER BY ordinal_position
       LOOP
          IF bVerbose THEN RAISE NOTICE '(col loop) name=%  type=%  udt_name=%  default=%  is_generated=%  gen_expr=%', v_colrec.column_name, v_colrec.data_type, v_colrec.udt_name, v_colrec.column_default, v_colrec.is_generated, v_colrec.generation_expression; END IF;
 
          SELECT CASE WHEN pg_get_serial_sequence(quote_ident(in_schema) || '.' || quote_ident(in_table), v_colrec.column_name) IS NOT NULL THEN True ELSE False END into bSerial;
          IF bVerbose THEN
 
            SELECT pg_get_serial_sequence(quote_ident(in_schema) || '.' || quote_ident(in_table), v_colrec.column_name) into v_temp;
            IF v_temp IS NULL THEN v_temp = 'NA'; END IF;
            SELECT pg_get_coldef(in_schema, in_table,v_colrec.column_name) INTO v_diag1;
            RAISE NOTICE 'DEBUG table: %  Column: %  datatype: %  Serial=%  serialval=%  coldef=%', v_qualified, v_colrec.column_name, v_colrec.data_type, bSerial, v_temp, v_diag1;
            RAISE NOTICE 'DEBUG tabledef: %', v_table_ddl;
          END IF;
 
 
          SELECT COUNT(*) INTO v_cnt1 FROM information_schema.columns t WHERE EXISTS (SELECT REGEXP_MATCHES(s.column_name, '([A-Z]+)','g') FROM information_schema.columns s
          WHERE t.table_schema=s.table_schema and t.table_name=s.table_name and t.column_name=s.column_name AND t.table_schema = quote_ident(in_schema) AND column_name = v_colrec.column_name);
 
          SELECT COUNT(*) INTO v_cnt2 FROM pg_get_keywords() WHERE word = v_colrec.column_name AND catcode = 'R';
 
          IF v_cnt1 > 0 OR v_cnt2 > 0 THEN
            v_table_ddl := v_table_ddl || '  "' || v_colrec.column_name || '" ';
          ELSE
            v_table_ddl := v_table_ddl || '  ' || v_colrec.column_name || ' ';
          END IF;
 
          IF v_colrec.is_generated = 'ALWAYS' and v_colrec.generation_expression IS NOT NULL THEN
 
              v_temp = v_colrec.data_type || ' GENERATED ALWAYS AS (' || v_colrec.generation_expression || ') STORED ';
          ELSEIF v_colrec.udt_name in ('geometry', 'box2d', 'box2df', 'box3d', 'geography', 'geometry_dump', 'gidx', 'spheroid', 'valid_detail') THEN
 		         v_temp = v_colrec.udt_name;
 		     ELSEIF v_colrec.data_type = 'USER-DEFINED' THEN
 		         v_temp = v_colrec.udt_schema || '.' || v_colrec.udt_name;
 		     ELSEIF v_colrec.data_type = 'ARRAY' THEN
 
 		         v_temp = pg_get_coldef(in_schema, in_table,v_colrec.column_name);
 
 		     ELSEIF pg_get_serial_sequence(quote_ident(in_schema) || '.' || quote_ident(in_table), v_colrec.column_name) IS NOT NULL THEN
 		         -- Issue#8 fix: handle serial. Note: NOT NULL is implied so no need to declare it explicitly
 		         v_temp = pg_get_coldef(in_schema, in_table,v_colrec.column_name);
 		     ELSE
 		         v_temp = v_colrec.data_type;
          END IF;
 
 
 
 		     IF v_colrec.is_identity = 'YES' THEN
 		         IF v_colrec.identity_generation = 'ALWAYS' THEN
 		             v_temp = v_temp || ' GENERATED ALWAYS AS IDENTITY NOT NULL';
 		         ELSE
 		             v_temp = v_temp || ' GENERATED BY DEFAULT AS IDENTITY NOT NULL';
 		         END IF;
          ELSEIF v_colrec.character_maximum_length IS NOT NULL THEN
              v_temp = v_temp || ('(' || v_colrec.character_maximum_length || ')');
          ELSEIF v_colrec.numeric_precision > 0 AND v_colrec.numeric_scale > 0 THEN
              v_temp = v_temp || '(' || v_colrec.numeric_precision || ',' || v_colrec.numeric_scale || ')';
          END IF;
 
 
          IF bSerial THEN
              v_temp = v_temp || ' NOT NULL';
          ELSEIF v_colrec.is_nullable = 'NO' THEN
              v_temp = v_temp || ' NOT NULL';
          ELSEIF v_colrec.is_nullable = 'YES' THEN
              v_temp = v_temp || ' NULL';
          END IF;
 
 
          IF v_colrec.column_default IS NOT null AND NOT bSerial THEN
 
              v_temp = v_temp || (' DEFAULT ' || v_colrec.column_default);
          END IF;
          v_temp = v_temp || ',' || E'\n';
 
          v_table_ddl := v_table_ddl || v_temp;
 
 
       END LOOP;
     END IF;
     IF bVerbose THEN RAISE NOTICE '(2)tabledef so far: %', v_table_ddl; END IF;
 
     IF v_pgversion < 110000 THEN
       FOR v_constraintrec IN
         SELECT con.conname as constraint_name, con.contype as constraint_type,
           CASE
             WHEN con.contype = 'p' THEN 1 -- primary key constraint
             WHEN con.contype = 'u' THEN 2 -- unique constraint
             WHEN con.contype = 'f' THEN 3 -- foreign key constraint
             WHEN con.contype = 'c' THEN 4
             ELSE 5
           END as type_rank,
           pg_get_constraintdef(con.oid) as constraint_definition
         FROM pg_catalog.pg_constraint con JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
         WHERE nsp.nspname = in_schema AND rel.relname = in_table ORDER BY type_rank
       LOOP
         v_constraint_name := v_constraintrec.constraint_name;
         v_constraint_def  := v_constraintrec.constraint_definition;
         IF v_constraintrec.type_rank = 1 THEN
             IF pkcnt = 0 OR pktype = 'PKEY_INTERNAL' THEN
 
                 v_constraint_name := v_constraintrec.constraint_name;
                 v_constraint_def  := v_constraintrec.constraint_definition;
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
 
               SELECT 'ALTER TABLE ONLY ' || in_schema || '.' || c.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_pkey_def
               FROM pg_catalog.pg_constraint r, pg_class c, pg_namespace n where r.conrelid = c.oid and  r.contype = 'p' and n.oid = r.connamespace and n.nspname = in_schema AND c.relname = in_table and r.conname = v_constraint_name;
             END IF;
             IF bPartition THEN
               continue;
             END IF;
         ELSIF v_constraintrec.type_rank = 3 THEN
 
             IF fktype = 'FKEYS_NONE' THEN
 
                 continue;
             ELSIF fkcnt = 0 OR fktype = 'FKEYS_INTERNAL' THEN
 
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
 
                 SELECT 'ALTER TABLE ONLY ' || n.nspname || '.' || c2.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_fkey_def
   			        FROM pg_constraint r, pg_class c1, pg_namespace n, pg_class c2 where r.conrelid = c1.oid and  r.contype = 'f' and n.nspname = in_schema and n.oid = r.connamespace and r.conrelid = c2.oid and c2.relname = in_table;
                 v_fkey_defs = v_fkey_defs || v_fkey_def || E'\n';
             END IF;
         ELSE
 
             v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
               || 'CONSTRAINT' || ' '
               || v_constraint_name || ' '
               || v_constraint_def
               || ',' || E'\n';
         END IF;
         if bVerbose THEN RAISE NOTICE 'DEBUG4: constraint name=% constraint_def=%', v_constraint_name,v_constraint_def; END IF;
         constraintarr := constraintarr || v_constraintrec.constraint_name:: text;
 
       END LOOP;
     ELSE
       FOR v_constraintrec IN
         SELECT con.conname as constraint_name, con.contype as constraint_type,
           CASE
             WHEN con.contype = 'p' THEN 1 -- primary key constraint
             WHEN con.contype = 'u' THEN 2 -- unique constraint
             WHEN con.contype = 'f' THEN 3 -- foreign key constraint
             WHEN con.contype = 'c' THEN 4
             ELSE 5
           END as type_rank,
           pg_get_constraintdef(con.oid) as constraint_definition
         FROM pg_catalog.pg_constraint con JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
         WHERE nsp.nspname = in_schema AND rel.relname = in_table
               --Issue#13 added this condition:
               AND con.conparentid = 0
               ORDER BY type_rank
       LOOP
         v_constraint_name := v_constraintrec.constraint_name;
         v_constraint_def  := v_constraintrec.constraint_definition;
         IF v_constraintrec.type_rank = 1 THEN
             IF pkcnt = 0 OR pktype = 'PKEY_INTERNAL' THEN
                 -- internal def
                 v_constraint_name := v_constraintrec.constraint_name;
                 v_constraint_def  := v_constraintrec.constraint_definition;
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
               SELECT 'ALTER TABLE ONLY ' || in_schema || '.' || c.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_pkey_def
               FROM pg_catalog.pg_constraint r, pg_class c, pg_namespace n where r.conrelid = c.oid and  r.contype = 'p' and n.oid = r.connamespace and n.nspname = in_schema AND c.relname = in_table;
             END IF;
             IF bPartition THEN
               continue;
             END IF;
         ELSIF v_constraintrec.type_rank = 3 THEN
 
             IF fktype = 'FKEYS_NONE' THEN
                 -- skip
                 continue;
             ELSIF fkcnt = 0 OR fktype = 'FKEYS_INTERNAL' THEN
                 -- internal def
                 v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
                   || 'CONSTRAINT' || ' '
                   || v_constraint_name || ' '
                   || v_constraint_def
                   || ',' || E'\n';
             ELSE
 
                 SELECT 'ALTER TABLE ONLY ' || n.nspname || '.' || c2.relname || ' ADD CONSTRAINT ' || r.conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) || ';' INTO v_fkey_def
   			        FROM pg_constraint r, pg_class c1, pg_namespace n, pg_class c2 where r.conrelid = c1.oid and  r.contype = 'f' and n.nspname = in_schema and n.oid = r.connamespace and r.conrelid = c2.oid and c2.relname = in_table and
   			        r.conname = v_constraint_name and r.conparentid = 0;
                 v_fkey_defs = v_fkey_defs || v_fkey_def || E'\n';
             END IF;
         ELSE
 
             v_table_ddl := v_table_ddl || '  ' -- note: two char spacer to start, to indent the column
               || 'CONSTRAINT' || ' '
               || v_constraint_name || ' '
               || v_constraint_def
               || ',' || E'\n';
         END IF;
         if bVerbose THEN RAISE NOTICE 'DEBUG4: constraint name=% constraint_def=%', v_constraint_name,v_constraint_def; END IF;
         constraintarr := constraintarr || v_constraintrec.constraint_name:: text;
 
        END LOOP;
     END IF;
 
 
     select substring(v_table_ddl, length(v_table_ddl) - 1, 1) INTO v_temp;
     IF v_temp = ',' THEN
         v_table_ddl = substr(v_table_ddl, 0, length(v_table_ddl) - 1) || E'\n';
     END IF;
     IF bVerbose THEN RAISE NOTICE '(3)tabledef so far: %', trim(v_table_ddl); END IF;
 
 
     IF bVerbose THEN RAISE NOTICE '(4)tabledef so far: %', v_table_ddl; END IF;
 
 
     IF bPartition and bInheritance THEN
 
       IF v_parent_schema = '' OR v_parent_schema IS NULL THEN v_parent_schema = in_schema; END IF;
       v_table_ddl := v_table_ddl || ') INHERITS (' || v_parent_schema || '.' || v_parent || ') ' || E'\n' || v_relopts || ' ' || v_tablespace || ';' || E'\n';
     END IF;
 
     IF v_pgversion >= 100000 AND NOT bPartition and NOT bInheritance THEN
       SELECT pg_get_partkeydef(c1.oid) as partition_key INTO v_partition_key FROM pg_class c1 JOIN pg_namespace n ON (n.oid = c1.relnamespace) LEFT JOIN pg_partitioned_table p ON (c1.oid = p.partrelid)
       WHERE n.nspname = in_schema and n.oid = c1.relnamespace and c1.relname = in_table and c1.relkind = 'p';
 
       IF v_partition_key IS NOT NULL AND v_partition_key <> '' THEN
         v_table_ddl := v_table_ddl || ') PARTITION BY ' || v_partition_key || ';' || E'\n';
       ELSEIF v_relopts <> '' THEN
         v_table_ddl := v_table_ddl || ') ' || v_relopts || ' ' || v_tablespace || ';' || E'\n';
       ELSE
 
         v_table_ddl := v_table_ddl || ') ' || v_tablespace || ';' || E'\n';
       END IF;
     END IF;
 
     IF bVerbose THEN RAISE NOTICE '(5)tabledef so far: %', v_table_ddl; END IF;
 
     IF v_pkey_def <> '' THEN
         v_table_ddl := v_table_ddl || v_pkey_def || E'\n';
     END IF;
 
 
     IF v_fkey_defs <> '' THEN
 	         v_table_ddl := v_table_ddl || v_fkey_defs || E'\n';
     END IF;
 
     IF bVerbose THEN RAISE NOTICE '(6)tabledef so far: %', v_table_ddl; END IF;
 
     FOR v_indexrec IN
       SELECT indexdef, COALESCE(tablespace, 'pg_default') as tablespace, indexname FROM pg_indexes WHERE (schemaname, tablename) = (in_schema, in_table)
     LOOP
 
       bSkip = False;
       FOREACH constraintelement IN ARRAY constraintarr
       LOOP
          IF constraintelement = v_indexrec.indexname THEN
              -- RAISE NOTICE 'DEBUG7: skipping index, %', v_indexrec.indexname;
              bSkip = True;
              EXIT;
          END IF;
       END LOOP;
       if bSkip THEN CONTINUE; END IF;
 
       v_indexrec.indexdef := REPLACE(v_indexrec.indexdef, 'CREATE INDEX', 'CREATE INDEX IF NOT EXISTS');
       v_indexrec.indexdef := REPLACE(v_indexrec.indexdef, 'CREATE UNIQUE INDEX', 'CREATE UNIQUE INDEX IF NOT EXISTS');
       IF v_partition_key IS NOT NULL AND v_partition_key <> '' THEN
           v_table_ddl := v_table_ddl || v_indexrec.indexdef || ';' || E'\n';
       ELSE
 					select CASE WHEN i.indpred IS NOT NULL THEN True ELSE False END INTO v_partial
 					FROM pg_index i JOIN pg_class c1 ON (i.indexrelid = c1.oid) JOIN pg_class c2 ON (i.indrelid = c2.oid)
 					WHERE c1.relnamespace::regnamespace::text = in_schema AND c2.relnamespace::regnamespace::text = in_schema AND c2.relname = in_table AND c1.relname = v_indexrec.indexname;
           IF v_partial THEN
               -- Put tablespace def before WHERE CLAUSE
               v_temp = v_indexrec.indexdef;
               v_pos = POSITION(' WHERE ' IN v_temp);
               v_temp2 = SUBSTRING(v_temp, v_pos);
               v_temp  = SUBSTRING(v_temp, 1, v_pos);
               v_table_ddl := v_table_ddl || v_temp || ' TABLESPACE ' || v_indexrec.tablespace || v_temp2 || ';' || E'\n';
           ELSE
               v_table_ddl := v_table_ddl || v_indexrec.indexdef || ' TABLESPACE ' || v_indexrec.tablespace || ';' || E'\n';
           END IF;
       END IF;
 
     END LOOP;
     IF bVerbose THEN RAISE NOTICE '(7)tabledef so far: %', v_table_ddl; END IF;
 
     -- Issue#20: added logic for table and column comments
     IF  cmtcnt > 0 THEN
         FOR v_rec IN
           SELECT c.relname, 'COMMENT ON ' || CASE WHEN c.relkind in ('r','p') AND a.attname IS NULL THEN 'TABLE ' WHEN c.relkind in ('r','p') AND a.attname IS NOT NULL THEN 'COLUMN ' WHEN c.relkind = 'f' THEN 'FOREIGN TABLE '
                  WHEN c.relkind = 'm' THEN 'MATERIALIZED VIEW ' WHEN c.relkind = 'v' THEN 'VIEW ' WHEN c.relkind = 'i' THEN 'INDEX ' WHEN c.relkind = 'S' THEN 'SEQUENCE ' ELSE 'XX' END || n.nspname || '.' ||
                  CASE WHEN c.relkind in ('r','p') AND a.attname IS NOT NULL THEN quote_ident(c.relname) || '.' || a.attname ELSE quote_ident(c.relname) END || ' IS '   || quote_literal(d.description) || ';' as ddl
 	   	    FROM pg_class c JOIN pg_namespace n ON (n.oid = c.relnamespace) LEFT JOIN pg_description d ON (c.oid = d.objoid) LEFT JOIN pg_attribute a ON (c.oid = a.attrelid AND a.attnum > 0 and a.attnum = d.objsubid)
 	   	    WHERE d.description IS NOT NULL AND n.nspname = in_schema AND c.relname = in_table ORDER BY 2 desc, ddl
         LOOP
             --RAISE NOTICE 'comments:%', v_rec.ddl;
             v_table_ddl = v_table_ddl || v_rec.ddl || E'\n';
         END LOOP;
     END IF;
     IF bVerbose THEN RAISE NOTICE '(8)tabledef so far: %', v_table_ddl; END IF;
 
     IF trigtype = 'INCLUDE_TRIGGERS' THEN
 	    -- Issue#14: handle multiple triggers for a table
       FOR v_trigrec IN
           select pg_get_triggerdef(t.oid, True) || ';' as triggerdef FROM pg_trigger t, pg_class c, pg_namespace n
           WHERE n.nspname = in_schema and n.oid = c.relnamespace and c.relname = in_table and c.relkind = 'r' and t.tgrelid = c.oid and NOT t.tgisinternal
       LOOP
           v_table_ddl := v_table_ddl || v_trigrec.triggerdef;
           v_table_ddl := v_table_ddl || E'\n';
           IF bVerbose THEN RAISE NOTICE 'triggerdef = %', v_trigrec.triggerdef; END IF;
       END LOOP;
     END IF;
 
     IF bVerbose THEN RAISE NOTICE '(9)tabledef so far: %', v_table_ddl; END IF;
     v_table_ddl := v_table_ddl || E'\n';
     IF bVerbose THEN RAISE NOTICE '(10)tabledef so far: %', v_table_ddl; END IF;
     IF search_path_old = '' THEN
       SELECT set_config('search_path', '', false) into v_temp;
     ELSE
       EXECUTE 'SET search_path = ' || search_path_old;
     END IF;
 
     RETURN v_table_ddl;
 
     EXCEPTION
     WHEN others THEN
     BEGIN
       GET STACKED DIAGNOSTICS v_diag1 = MESSAGE_TEXT, v_diag2 = PG_EXCEPTION_DETAIL, v_diag3 = PG_EXCEPTION_HINT, v_diag4 = RETURNED_SQLSTATE, v_diag5 = PG_CONTEXT, v_diag6 = PG_EXCEPTION_CONTEXT;
       v_ret := 'line=' || v_diag6 || '. '|| v_diag4 || '. ' || v_diag1;
       RAISE EXCEPTION '%', v_ret;
        RETURN '';
     END;
 
   END;
  $$//
DELIMITER ;

-- Dumping structure for table vault.items
CREATE TABLE IF NOT EXISTS "items" (
	"id" SERIAL NOT NULL,
	"account_id" SERIAL NOT NULL,
	"type" UNKNOWN NOT NULL DEFAULT 'other',
	"name" VARCHAR(150) NOT NULL,
	"username" VARCHAR(150) NULL DEFAULT NULL,
	"email" VARCHAR(255) NULL DEFAULT NULL,
	"password" TEXT NULL DEFAULT NULL,
	"otp_secret" TEXT NULL DEFAULT NULL,
	"description" TEXT NULL DEFAULT NULL,
	"created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "items_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table vault.items: -1 rows
/*!40000 ALTER TABLE "items" DISABLE KEYS */;
/*!40000 ALTER TABLE "items" ENABLE KEYS */;

-- Dumping structure for table vault.item_tags
CREATE TABLE IF NOT EXISTS "item_tags" (
	"item_id" INTEGER NOT NULL,
	"tag_id" INTEGER NOT NULL,
	CONSTRAINT "item_tags_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT "item_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table vault.item_tags: -1 rows
/*!40000 ALTER TABLE "item_tags" DISABLE KEYS */;
/*!40000 ALTER TABLE "item_tags" ENABLE KEYS */;

-- Dumping structure for table vault.tags
CREATE TABLE IF NOT EXISTS "tags" (
	"id" SERIAL NOT NULL,
	"account_id" BIGINT NOT NULL,
	"name" VARCHAR(50) NOT NULL,
	"color" VARCHAR(7) NULL DEFAULT NULL,
	CONSTRAINT "tags_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"."users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Dumping data for table vault.tags: -1 rows
/*!40000 ALTER TABLE "tags" DISABLE KEYS */;
/*!40000 ALTER TABLE "tags" ENABLE KEYS */;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
