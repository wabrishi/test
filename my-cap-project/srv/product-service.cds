using { sap.capire.bookshop as my } from '../db/schema';

service ProductService {
    entity Products as projection on my.Products;
}
