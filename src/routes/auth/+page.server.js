import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isValidUsername } from '$lib/server/username.js';

export const actions = {
	signup: async ({ request, locals: { supabase }, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const username = formData.get('username');
		const display_name = formData.get('display_name');

		// Validate username format (must already be kebab-case)
		if (!isValidUsername(username)) {
			return fail(400, {
				error:
					'Invalid username format. Use only lowercase letters, numbers, and hyphens (e.g., john-doe-123)'
			});
		}

		console.log('=== SIGNUP ATTEMPT ===');
		console.log('Email:', email);
		console.log('Username:', username);
		console.log('Display Name:', display_name);

		// Local dev bypass
		if (env.USE_LOCAL_AUTH === 'true') {
			cookies.set('local-auth-email', email, { path: '/' });
			redirect(303, '/');
		}

		// Sign up the user with Supabase Auth
		// Pass username and display_name in user metadata so the trigger can access it
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username,
					display_name
				}
			}
		});

		if (error) {
			console.error('=== SIGNUP ERROR ===');
			console.error('Error code:', error.code);
			console.error('Error message:', error.message);
			console.error('Error details:', JSON.stringify(error, null, 2));
			redirect(303, '/auth/error');
		}

		console.log('=== SIGNUP SUCCESS ===');
		console.log('User ID:', data.user?.id);
		console.log('User email:', data.user?.email);
		console.log('User metadata:', data.user?.user_metadata);

		// The user_profiles record will be automatically created by the database trigger
		// defined in 20250727010707_enable_rls_policies.sql
		redirect(303, '/');
	},
	login: async ({ request, locals: { supabase }, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		// Local dev bypass
		if (env.USE_LOCAL_AUTH === 'true') {
			cookies.set('local-auth-email', email, { path: '/' });
			redirect(303, '/profile');
		}

		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			console.error(error);
			redirect(303, '/auth/error');
		} else {
			redirect(303, '/profile');
		}
	}
};
