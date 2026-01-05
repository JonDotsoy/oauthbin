import { db, OAuthClients } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// Crear un cliente OAuth por defecto para desarrollo
	await db.insert(OAuthClients).values({
		client_id: '20260104.apps.localhost',
		client_secret: '20260104.secret'
	});
}
