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
			<li><a href="/no-such-model">No Such Model</a></li>
			<li><a href="/lora-not-supported">LoRA not supported</a></li>
		</ul>
	`);
});

app.get('/lora-not-supported', async (c) => {
	let response;
	try {
		response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
			prompt: 'This model does not support loras',
			lora: 'jklol'
		});
	} catch (err) {
		return c.json({ err, t: typeof err});
	}
	return c.json({ success: true, response });
});


app.get('/no-such-model', async (c) => {
	let response;
	try {
		response = await c.env.AI.run('@cf/this/is/not/real', {
			prompt: 'jklol',
		});
	} catch (err) {
		return c.json({ err, t: typeof err});
	}
	return c.json({ success: true, response });
});

export default app;
