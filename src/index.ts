import { Hono } from 'hono';

type Bindings = {
	[key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
	// TODO: make this generate automatically
	return c.html(`
		<h1>AI Error Explorer</h1>
		<a href="/no-such-model">No Such Model</a>
	`);
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
