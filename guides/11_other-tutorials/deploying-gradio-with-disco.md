# Self-Hosting a Gradio app with Disco

Tags: DEPLOYMENT


### Introduction

Gradio is a fantastic open-source Python library that allows you to build and share machine learning apps and demos with just a few lines of code. While Gradio offers free hosting on [Hugging Face Spaces](https://huggingface.co/spaces), you might want to deploy your app on your own server for more control, or to integrate it with other services.

This tutorial will guide you through deploying a Gradio application on your own server using [Disco](https://disco.cloud/), an open-source platform that simplifies the deployment process. With Disco, you can enjoy the benefits of self-hosting without the usual complexities of server setup and maintenance. By the end, you'll have a working Gradio app deployed on your own server with automatic HTTPS and continuous deployment from GitHub.

### Prerequisites

Before you begin, make sure you have the following:

- A server with a fresh install of Ubuntu (4GB of RAM or more is recommended). You can get one from providers like [DigitalOcean](https://www.digitalocean.com/), [Hetzner](https://www.hetzner.com/cloud) or [AWS EC2](https://aws.amazon.com/ec2/).
- A domain name that you can configure.
- A GitHub account.
- Basic knowledge of the command line.

### Step 1: Create a Server

First, you'll need a server to host your Gradio app. Choose a provider and create a new server with Ubuntu 24.04 as the operating system.

Once your server is up and running, take note of its IP address. You'll need it for the next step.

### Step 2: Configure DNS Settings

Before going further, you need to set up two domain names. Go to your domain registrar's DNS management panel and add these records:

1.  A domain for your Disco server (e.g., `disco.example.com`).
2.  A domain for your Gradio application (e.g., `gradio.example.com`).

For the server domain, create an **A record** pointing to your server's IP address:

- **Type**: A
- **Name**: disco
- **Value**: `<your_server_ip_address>`

For the application domain, create a **CNAME record** pointing to your server domain:

- **Type**: CNAME
- **Name**: gradio
- **Value**: `disco.example.com`

DNS changes can take a few minutes to propagate. You can verify that your server domain is resolving to the correct IP address by running `ping disco.example.com`

### Step 3: Test Your Server Connection

Now that your DNS is set up, let's test the SSH connection to your server from your local machine. This ensures you can access it before we hand things over to Disco.

```bash
# Replace with your server domain
ssh root@disco.example.com
```

If the connection is successful, great! **This is the last time you'll need to SSH into this server manually.** Now, exit the SSH session to return to your local machine. This is a crucial step!

```bash
exit
```

### Step 4: Install the Disco CLI on Your Local Machine

**Important:** From this point forward, all commands should be run from your **local machine's terminal**. You will not need to SSH into your server again.

Let's install the Disco command-line interface (CLI) on your local machine. This is the tool you'll use to manage your deployments.

```bash
curl https://cli-assets.letsdisco.dev/install.sh | sh
```

After the installation is complete, verify it's working by running:

```bash
disco --version
```

### Step 5: Initialize Your Server with Disco

Now, from your local machine, let's set up Disco on your server using the domain you configured.

```bash
# Replace with your server domain
disco init root@disco.example.com
```

This command will:

- Connect to your server using SSH.
- Install Docker.
- Set up the Disco server.
- Configure the initial SSL certificate.

Tip: Disco will automatically try to use your default SSH keys. If you use a non-standard key, you can specify the path with the `-i` flag, like so: `disco init -i /path/to/your/ssh/key root@disco.example.com`

### Step 6: Fork the Example Gradio App

For this tutorial, we'll use an example Gradio application. Go to this [example Gradio app repository](https://github.com/letsdiscodev/example-gradio-site) on GitHub and click the "Fork" button to create a copy of it in your own GitHub account.

### Step 7: Connect Disco to GitHub

To allow Disco to deploy your application from GitHub, you need to connect your GitHub account. Run the following command on your local machine:

```bash
disco github:apps:add
```

This command will open a browser window where you can authorize Disco with GitHub. You'll need to:

1. Give the GitHub application a name (any name will do).
2. Select the repository you just forked (`example-gradio-site`).
3. Click "Install".

### Step 8: Deploy Your Gradio App

Now you're ready to deploy your Gradio app. We'll use the `projects:add` command on your local machine. Below, replace `<your_github_username>` with your GitHub username and `gradio.example.com` with the application domain you configured earlier.

```bash
disco projects:add \
  --name gradio-app \
  --github <your_github_username>/example-gradio-site \
  --domain gradio.example.com
```

Disco will automatically pull your code from GitHub, build the Docker container, deploy it to your server, and set up HTTPS with Let's Encrypt for your domain.

### Step 9: Test Your Deployed App

Once the deployment is complete, open your web browser and navigate to your application's domain: `https://gradio.example.com`. You should see your Gradio app running live!

### Making Changes and Automatic Deployment

One of the best features of Disco is automatic deployment. Whenever you push changes to your GitHub repository, Disco will detect them, rebuild your application, and deploy it automatically.

To test this, modify the `app.py` file in your forked repository, then commit and push the changes to GitHub. Within seconds, your deployed app will be updated.

### Conclusion

Congratulations! You have successfully deployed a Gradio application on your own server using Disco. You now have a fully managed deployment pipeline with automatic HTTPS, fast deployments triggered by Git pushes, and complete control over your server and application.

This setup provides the best of both worlds: the flexibility and cost-effectiveness of self-hosting combined with the convenience of a platform-as-a-service. For more advanced configurations and features, be sure to check out the [Disco documentation](https://docs.letsdisco.dev/) and the [Gradio documentation](https://www.gradio.app/docs).
