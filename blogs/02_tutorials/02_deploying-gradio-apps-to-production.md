# Deploying Gradio Apps to Production

Author: Gradio Team
Date: 2026-03-19
Tags: tutorial, deployment, production

You've built a Gradio app and it works great locally. Now what? In this post, we'll cover the most common ways to deploy your Gradio app so that it's accessible to your users around the clock.

## Option 1: Hugging Face Spaces

The easiest path to production is [Hugging Face Spaces](https://huggingface.co/spaces). It's free for basic usage and requires minimal configuration.

Create a `requirements.txt` with your dependencies, write your `app.py`, and push to a Space repository:

```bash
# Create a new Space
huggingface-cli repo create my-gradio-app --type space --space-sdk gradio

# Clone and add your code
git clone https://huggingface.co/spaces/your-username/my-gradio-app
cd my-gradio-app
# Add your app.py and requirements.txt
git add . && git commit -m "Initial commit" && git push
```

Your app will be live within minutes at `https://huggingface.co/spaces/your-username/my-gradio-app`.

## Option 2: Docker

For more control over your deployment environment, Docker is a solid choice:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860
CMD ["python", "app.py"]
```

Make sure your app launches on the right host and port:

```python
demo.launch(server_name="0.0.0.0", server_port=7860)
```

## Option 3: Cloud Platforms

Gradio apps are standard Python web applications under the hood, so they work anywhere you can run Python:

- **AWS** — Deploy on EC2, ECS, or Lambda (with some constraints)
- **GCP** — Cloud Run is a great fit for containerized Gradio apps
- **Azure** — App Service or Container Instances both work well

## Production Considerations

When moving to production, keep these in mind:

### Authentication

Gradio supports basic authentication out of the box:

```python
demo.launch(auth=("admin", "your-secure-password"))
```

For more sophisticated auth, consider putting Gradio behind a reverse proxy like Nginx with your own authentication layer.

### Scaling

Gradio apps handle concurrent users well, but for high-traffic applications:

- Use the `max_threads` parameter to control concurrency
- Consider running multiple replicas behind a load balancer
- Enable request queuing with `demo.queue()` for long-running predictions

### Monitoring

Keep an eye on your app's health by checking the built-in `/info` endpoint and integrating with your existing monitoring tools.

## Wrapping Up

There's no single "right" way to deploy a Gradio app — it depends on your scale, budget, and infrastructure preferences. For most use cases, Hugging Face Spaces is the fastest path. For enterprise deployments, Docker with your cloud provider of choice gives you the most flexibility.

Check out the [Sharing Your App guide](/guides/sharing-your-app) for more details on deployment options.
