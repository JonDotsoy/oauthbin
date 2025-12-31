import { db, OAuthClients } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// Crear un cliente OAuth por defecto para desarrollo
	await db.insert(OAuthClients).values({
		client_id: 'default-client-id',
		client_secret: 'default-client-secret'
	});
}
