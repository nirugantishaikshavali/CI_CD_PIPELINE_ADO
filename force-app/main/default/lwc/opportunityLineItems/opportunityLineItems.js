import { LightningElement, wire, api } from 'lwc';
import getLineItems from '@salesforce/apex/OpportunityLineItemController.getLineItems';
import getTotalCount from '@salesforce/apex/OpportunityLineItemController.getTotalCount';
const columns = [
    {
        label: 'Product',
        fieldName: 'productName',
        sortable: false
    },
    {
        label: 'Quantity',
        fieldName: 'Quantity',
        type: 'number',
        sortable: true
    },
    {
        label: 'Total Price',
        fieldName: 'TotalPrice',
        type: 'currency',
        sortable: true
    },
    {
        label: 'Unit Price',
        fieldName: 'UnitPrice',
        type: 'currency',
        sortable: true
    }
];

export default class OpportunityLineItems extends LightningElement {

    columns = columns;
    currentPage = 1;
    totalRecords = 0;

    oppLineRecords = [];
    error;

    @api recordId;

    pageSize = 10;
    offsetValue = 0;

    sortField = 'TotalPrice';
    sortDirection = 'DESC';

    @wire(getLineItems, {
        opportunityId: '$recordId',
        pageSize: '$pageSize',
        offsetValue: '$offsetValue',
        sortField: '$sortField',
        sortDirection: '$sortDirection'
    })
    wiredResult({ data, error }) {

        if (data) {

            console.log('Line Items:', data);

            this.oppLineRecords = data.map(item => ({
                ...item,
                productName: item.PricebookEntry?.Name
            }));

            this.error = undefined;

        } else if (error) {

            console.error('Error:', error);

            this.error = error;
            this.oppLineRecords = [];
        }
    }


    connectedCallback() {
    this.loadTotalCount();
    }


   loadTotalCount(){
    getTotalCount({
        opportunityId:this.recordId
    }).then(result=>{
        this.totalRecords=result;
    }).catch(error=>{
        console.log(error);
    })
   }


    get hasOpportunityLineItem() {
        return this.oppLineRecords &&
               this.oppLineRecords.length > 0;
    }

    get totalPages(){
        return Math.ceil(this.totalRecords/this.pageSize);
    }

    handleNext(){
        if(this.currentPage<this.totalPages){
            this.currentPage++;
            this.offsetValue=(this.currentPage-1)*this.pageSize;
        }
    }

    handlePrevious() {
    if (this.currentPage > 1) {

        this.currentPage--;

        this.offsetValue =
            (this.currentPage - 1) * this.pageSize;
    }
    }


    get isPreviousDisabled() {
    return this.currentPage === 1;
}

get isNextDisabled() {
    return this.currentPage >= this.totalPages;
}


handleSort(event) {

    this.sortField = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;

    this.currentPage = 1;
    this.offsetValue = 0;
}

}