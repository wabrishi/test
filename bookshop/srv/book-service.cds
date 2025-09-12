using { sap.capire.bookshop.Books as BaseBooks } from '../db/schema.cds'; // Correct namespace and alias

service BookService @(path:'/bookshop') {
  @Capabilities.Insertable: ['Creator', 'Admin']
  @Capabilities.Readable: ['Viewer', 'Creator', 'Editor', 'Admin']
  @Capabilities.Updatable: ['Editor', 'Admin']
  @Capabilities.Deletable: ['Admin']
  entity Books as projection on BaseBooks; // Project on the aliased BaseBooks
}
