import type { LocalsUser } from '$lib/models/LocalsAccount';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: LocalsUser;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
