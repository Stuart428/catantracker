
import { deploySchema, dropSchema } from './db';

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');
  
  try {
    if (shouldReset) {
      console.log('Dropping existing schema...');
      await dropSchema();
    }
    
    console.log('Deploying database schema...');
    await deploySchema();
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
