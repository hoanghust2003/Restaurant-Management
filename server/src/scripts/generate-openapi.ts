import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { swaggerConfig } from '../swagger-config';
import * as fs from 'fs';
import * as path from 'path';

async function generateOpenApiSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  
  // Write OpenAPI spec to file
  const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json');
  const docsDir = path.dirname(outputPath);
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  
  console.log(`OpenAPI specification generated at: ${outputPath}`);
  
  // Also generate YAML version
  const yaml = require('js-yaml');
  const yamlPath = path.resolve(process.cwd(), 'docs', 'openapi.yaml');
  fs.writeFileSync(yamlPath, yaml.dump(document));
  
  console.log(`OpenAPI specification (YAML) generated at: ${yamlPath}`);
  
  await app.close();
}

generateOpenApiSpec().catch(err => {
  console.error('Error generating OpenAPI spec:', err);
  process.exit(1);
});
