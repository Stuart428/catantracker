
#!/bin/bash

# Navigate to server directory
cd server

# Install TypeScript and types
npm install typescript @types/node ts-node --save-dev

# Install Express.js and its types
npm install express
npm install @types/express --save-dev

# Install ESLint and related packages
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev

# Create tsconfig.json file
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOL

# Create .eslintrc.js file
cat > .eslintrc.js << EOL
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Add custom rules here
  },
};
EOL

# Create src directory if it doesn't exist
mkdir -p src

# Create a basic Express server file
cat > src/server.ts << EOL
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
EOL

# Update package.json scripts
npx json -I -f package.json -e "this.scripts = { 
  ...this.scripts,
  'build': 'tsc',
  'start': 'node dist/server.js',
  'dev': 'ts-node src/server.ts',
  'lint': 'eslint src/**/*.ts'
}"

# Install json tool to update package.json
npm install -g json

echo "Setup complete!"
