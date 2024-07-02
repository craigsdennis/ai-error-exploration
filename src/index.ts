import { Hono } from 'hono';

type Bindings = {
	[key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
	// TODO: make this generate automatically
	return c.html(`
		<h1>AI Error Explorer</h1>
		<ul>
			<li><a href="/rest/works">Working REST Call</a></li>
			<li><a href="/no-such-model">No Such Model</a> | <a href="/rest/no-such-model">REST No Such Model</a></li>
			<li><a href="/lora-not-supported">LoRA not supported</a> | <a href="/rest/lora-not-supported">LoRA not supported</a></li>
		</ul>
	`);
});

async function restCall(env: Bindings, model: string, input: object) {
	return fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`, {
		headers: {
			Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
			'Content-Type': 'application/json',
		},
		method: 'POST',
		body: JSON.stringify(input),
	});
}

app.get('/lora-not-supported', async (c) => {
	let response;
	try {
		response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
			prompt: 'This model does not support loras',
			lora: 'jklol',
		});
	} catch (err) {
		return c.json({ err, t: typeof err });
	}
	return c.json({ success: true, response });
});

app.get('/rest/lora-not-supported', async (c) => {
	const response = await restCall(c.env, '@cf/meta/llama-3-8b-instruct', {
		prompt: 'Respond with the word "broken" and nothing else',
		lora: 'jklol',
	});
	if (!response.ok) {
		const body = await response.json();
		return c.json({ status: response.status, statusText: response.statusText, body });
	}
	return c.json({ response });
});

app.get('/rest/works', async (c) => {
	const result = await restCall(c.env, '@cf/meta/llama-3-8b-instruct', { prompt: "Respond with only the word 'works' and nothing else" });
	const obj = await result.json();
	// @ts-ignore
	return c.json(obj);
});

app.get('/no-such-model', async (c) => {
	let response;
	try {
		response = await c.env.AI.run('@cf/this/is/not/real', {
			prompt: 'jklol',
		});
	} catch (err) {
		return c.json({ err, t: typeof err });
	}
	return c.json({ success: true, response });
});

app.get('/rest/no-such-model', async (c) => {
	const response = await restCall(c.env, '@cf/this/does/not/exist', { prompt: 'Respond with the word "broken" and nothing else' });
	if (!response.ok) {
		const body = await response.json();
		return c.json({ status: response.status, statusText: response.statusText, body });
	}
	return c.json({ response });
});

export default app;
