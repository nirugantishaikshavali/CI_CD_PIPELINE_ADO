import { LightningElement, api } from 'lwc';
import getLineItems from '@salesforce/apex/OpportunityLineItemController.getLineItems';
import getTotalCount from '@salesforce/apex/OpportunityLineItemController.getTotalCount';

const columns = [
    {
        label: 'Product',
        fieldName: 'productName'
    },
    {
        label: 'Quantity',
        fieldName: 'Quantity',
        type: 'number'
    },
    {
        label: 'Unit Price',
        fieldName: 'UnitPrice',
        type: 'currency'
    },
    {
        label: 'Total Price',
        fieldName: 'TotalPrice',
        type: 'currency'
    }
];

export default class OpportunityLineItemInfinite extends LightningElement {

    @api recordId;

    columns = columns;
    oppLineRecords = [];

    pageSize = 10;
    offsetValue = 0;

    totalRecords = 0;
    isLoading = false;
    hasMoreRecords = true;

    connectedCallback() {
        this.loadTotalCount();
    }

    // Get total number of records
    loadTotalCount() {

        getTotalCount({
            opportunityId: this.recordId
        })
        .then(result => {

            this.totalRecords = result;

            // After getting total count,
            // load the first 10 records.
            this.loadLineItems();

        })
        .catch(error => {

            console.error('Count Error:', error);

        });
    }

    // Initial load
    loadLineItems() {

        this.isLoading = true;

        getLineItems({
            opportunityId: this.recordId,
            pageSize: this.pageSize,
            offsetValue: this.offsetValue,
            sortField: 'TotalPrice',
            sortDirection: 'DESC'
        })
        .then(result => {

            this.oppLineRecords = result.map(item => ({
                ...item,
                productName: item.PricebookEntry?.Name
            }));

            // Update offset based on records actually returned
            this.offsetValue = this.oppLineRecords.length;

            // Check whether more records are available
            if (this.oppLineRecords.length >= this.totalRecords) {
                this.hasMoreRecords = false;
            }

        })
        .catch(error => {

            console.error('Error:', error);

        })
        .finally(() => {

            this.isLoading = false;

        });
    }

    // Called automatically when user reaches bottom
    handleLoadMore() {

        // Prevent duplicate Apex calls
        if (this.isLoading || !this.hasMoreRecords) {
            return;
        }

        this.isLoading = true;

        getLineItems({
            opportunityId: this.recordId,
            pageSize: this.pageSize,
            offsetValue: this.offsetValue,
            sortField: 'TotalPrice',
            sortDirection: 'DESC'
        })
        .then(result => {

            const newRecords = result.map(item => ({
                ...item,
                productName: item.PricebookEntry?.Name
            }));

            // Append new records
            this.oppLineRecords = [
                ...this.oppLineRecords,
                ...newRecords
            ];

            // Move offset forward
            this.offsetValue += newRecords.length;

            // Stop loading when all records are retrieved
            if (this.oppLineRecords.length >= this.totalRecords) {
                this.hasMoreRecords = false;
            }

        })
        .catch(error => {

            console.error('Load More Error:', error);

        })
        .finally(() => {

            this.isLoading = false;

        });
    }
}