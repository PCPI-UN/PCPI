-- Script de inicialización de la base de datos PCPI
-- Este script se ejecuta automáticamente cuando se crea el contenedor por primera vez

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear esquemas para cada servicio (opcional, pero recomendado para organización)
-- CREATE SCHEMA IF NOT EXISTS auth;
-- CREATE SCHEMA IF NOT EXISTS invitations;
-- CREATE SCHEMA IF NOT EXISTS projects;
-- CREATE SCHEMA IF NOT EXISTS events;
-- CREATE SCHEMA IF NOT EXISTS evaluations;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos PCPI inicializada correctamente!';
END $$;
