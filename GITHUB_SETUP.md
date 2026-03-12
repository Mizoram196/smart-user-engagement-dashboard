# Pushing to GitHub

Follow these steps to upload your project to GitHub.

### 1. Initialize Git
Open your terminal in the `smart-dashboard` root folder:
```bash
git init
```

### 2. Add files
```bash
git add .
```

### 3. Commit
```bash
git commit -m "Initial commit: Smart User Engagement Dashboard"
```

### 4. Create Repository on GitHub
1. Go to [github.com/new](https://github.com/new)
2. Name it `smart-user-engagement-dashboard`
3. Click "Create Repository"
4. Copy the two lines under "…or push an existing repository from the command line" (usually starting with `git remote add origin ...`)

### 5. Push code
Paste those lines into your terminal and run them. It will look like this:
```bash
git remote add origin https://github.com/YOUR_USERNAME/smart-user-engagement-dashboard.git
git branch -M main
git push -u origin main
```
