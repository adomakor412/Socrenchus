#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from 'fs';
import path from 'path';
import { schema } from '../graphql';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

// Save JSON of full schema introspection for Babel Relay Plugin to use
graphql(schema, introspectionQuery).then((result) => {
  if (result.errors) {
    console.error(
      'ERROR introspecting schema: ',
      JSON.stringify(result.errors, null, 2)
    );
  } else {
    console.log('writing schema.json...');
    fs.writeFileSync(
      path.join(__dirname, '../../app/utils/schema.json'),
      JSON.stringify(result, null, 2)
    );
    
    // Save user readable type system shorthand of schema
    console.log('writing schema.graphql...');
    fs.writeFileSync(
      path.join(__dirname, '../../app/utils/schema.graphql'),
      printSchema(schema)
    );
    
    console.log('done.');
    process.exit();
  }
});