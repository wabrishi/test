using { managed } from '@sap/cds/common';
namespace sap.capire.bookshop;

entity Products : managed {
  key ID : Integer;
  @mandatory name  : localized String(111);
  @mandatory descr  : localized String(1111);
  @mandatory price  : Decimal;
  quantity : Integer;
}
