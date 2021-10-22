import { LightningElement, api, wire, track } from 'lwc';
import fetchPaginationMetadata from '@salesforce/apex/PaginationMetadata.fetchPaginationMetadata';
export default class Pagination extends LightningElement {
    @track disabledPrevious = true;
    @track disabledNext;

    @wire(fetchPaginationMetadata) pageRecordsList;

    @api get options(){
        let returnOptions = [];
        console.log(JSON.stringify(this.pageRecordsList.data));
        if(this.pageRecordsList.data){
            this.pageRecordsList.data.forEach(element=>{
                returnOptions.push({label: element.Amount_Records__c, value: element.Amount_Records__c});
            });
           
        }
        console.log(returnOptions);
        return returnOptions;
    }

    @api
    hanldeChangeView(status){
        if(status === 'previousDisable'){
            this.disabledPrevious = true;
        }
        if(status === 'previousEnable'){
            this.disabledPrevious = false;
        }
        if(status === 'nextDisable'){
            this.disabledNext = true;        
        }
        if(status === 'nextEnable'){
            this.disabledNext = false;
        }
    }
    // renderedCallback(){
    //     this.disabledPrevious = true;    
    // }

    handlePrevious() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    handleNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }
    handleFirst(){
        this.dispatchEvent(new CustomEvent('first'));
    }
    handleLast(){
        this.dispatchEvent(new CustomEvent('last'));
    }

    handleSelectChange(event) {
        event.preventDefault();
        const value = event.target.value;
        console.log(value);
        const selectedTableSizeEvent = new CustomEvent('selected', { detail: value});

        this.dispatchEvent(selectedTableSizeEvent);
    }
}