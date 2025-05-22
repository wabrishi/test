sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox", // Added MessageBox
    "sap/ui/model/json/JSONModel" // Though not explicitly used for dialog data model in this version
], function (Controller, Fragment, MessageToast, MessageBox, JSONModel) { // Added MessageBox to function params
    "use strict";

    return Controller.extend("ui5.products.controller.MainView", {

        _dialog: null, // To store the dialog instance
        _editingProductContext: null, // To store the context of the product being edited

        onInit: function () {
            // Initialization code can go here
        },

        _getDialog: function () {
            return new Promise(function(resolve, reject) {
                if (!this._dialog) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "ui5.products.view.CreateProductDialog", // We reuse the same dialog
                        controller: this
                    }).then(function (oDialog) {
                        this._dialog = oDialog;
                        this.getView().addDependent(this._dialog);
                        resolve(this._dialog);
                    }.bind(this)).catch(reject);
                } else {
                    resolve(this._dialog);
                }
            }.bind(this));
        },

        onOpenCreateDialog: function () {
            this._editingProductContext = null; // Ensure we are in create mode
            this._getDialog().then(function(oDialog) {
                oDialog.setTitle("Create New Product");
                this._clearDialogInputs();
                oDialog.open();
            }.bind(this));
        },

        onOpenEditDialog: function (oEvent) {
            this._editingProductContext = oEvent.getSource().getBindingContext(); // Get context of the selected product
            if (!this._editingProductContext) {
                MessageToast.show("Could not determine product to edit.");
                return;
            }

            this._getDialog().then(function(oDialog) {
                oDialog.setTitle("Edit Product");
                const oProduct = this._editingProductContext.getObject();
                const oView = this.getView();
                Fragment.byId(oView.getId(), "nameInput").setValue(oProduct.name);
                Fragment.byId(oView.getId(), "descrInput").setValue(oProduct.descr);
                Fragment.byId(oView.getId(), "priceInput").setValue(oProduct.price);
                Fragment.byId(oView.getId(), "quantityInput").setValue(oProduct.quantity);
                oDialog.open();
            }.bind(this));
        },

        onSaveProduct: function () {
            const oView = this.getView();
            const sName = Fragment.byId(oView.getId(), "nameInput").getValue();
            const sDescr = Fragment.byId(oView.getId(), "descrInput").getValue();
            const sPrice = Fragment.byId(oView.getId(), "priceInput").getValue();
            const sQuantity = Fragment.byId(oView.getId(), "quantityInput").getValue();

            if (!sName || !sDescr || !sPrice) {
                MessageToast.show("Name, Description, and Price are required.");
                return;
            }

            const nPrice = parseFloat(sPrice);
            const nQuantity = sQuantity ? parseInt(sQuantity, 10) : null; // Handle optional quantity

            if (this._editingProductContext) { // === UPDATE Product ===
                const oContext = this._editingProductContext;
                const oModel = oContext.getModel();
            
                // Set updated values on the context itself (OData V4 supports this)
                oContext.setProperty("name", sName);
                oContext.setProperty("descr", sDescr);
                oContext.setProperty("price", nPrice);
                oContext.setProperty("quantity", nQuantity !== null ? nQuantity : null);
            
                // Submit batch if there are changes
                if (oModel.hasPendingChanges()) {
                    oModel.submitBatch("$auto")
                        .then(() => {
                            MessageToast.show("Product updated: " + sName);
                            // Optional: refresh list/table if needed
                            // this.byId("productsTable").getBinding("items").refresh();
                        })
                        .catch((oError) => {
                            MessageToast.show("Error updating product: " + oError.message);
                        });
                } else {
                    MessageToast.show("No changes detected for product: " + sName);
                }
            }            
             else { // === CREATE Product ===
                const oProductPayload = {
                    name: sName,
                    descr: sDescr,
                    price: nPrice,
                    quantity: nQuantity
                };
                const oTable = this.byId("productsTable");
                const oBinding = oTable.getBinding("items");
                oBinding.create(oProductPayload);
                // MessageToast.show("Product creation initiated: " + oProductPayload.name); // Create message handled by request flow
            }
            this.onCloseDialog();
        },

        onCloseDialog: function () {
            if (this._dialog) {
                this._clearDialogInputs();
                this._dialog.close();
            }
            this._editingProductContext = null; // Clear editing context
        },

        _clearDialogInputs: function() {
            if (this._dialog) {
                const oView = this.getView();
                Fragment.byId(oView.getId(), "nameInput").setValue("");
                Fragment.byId(oView.getId(), "descrInput").setValue("");
                Fragment.byId(oView.getId(), "priceInput").setValue("");
                Fragment.byId(oView.getId(), "quantityInput").setValue("");
            }
        },

        onExit: function() {
            if (this._dialog) {
                this._dialog.destroy();
                this._dialog = null;
            }
        },

        onDeleteProduct: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                MessageToast.show("Could not determine product to delete.");
                return;
            }

            const sProductName = oContext.getProperty("name"); // For the confirmation message

            MessageBox.confirm("Are you sure you want to delete product: '" + sProductName + "'?", {
                title: "Confirm Deletion",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        // User confirmed deletion
                        oContext.delete().then(function () {
                            MessageToast.show("Product '" + sProductName + "' deleted successfully.");
                            // The list should refresh automatically. If not, you might need:
                            // this.byId("productsTable").getBinding("items").refresh();
                        }.bind(this)).catch(function (oError) {
                            MessageToast.show("Error deleting product '" + sProductName + "': " + oError.message);
                        });
                    } else {
                        MessageToast.show("Deletion of '" + sProductName + "' cancelled.");
                    }
                }.bind(this) // Ensure 'this' context is correct in onClose
            });
        }
    });
});
