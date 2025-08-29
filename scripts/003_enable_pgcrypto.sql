-- ensure pgcrypto is available so gen_random_uuid() works for UUID defaults
create extension if not exists "pgcrypto";
