import { LightningElement, api, track, wire } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import readCSV from '@salesforce/apex/sensorManagementController.readCSVData';
import getSensors from '@salesforce/apex/sensorManagementController.getSensors';
import getBaseStations from '@salesforce/apex/sensorManagementController.getBaseStations';
// import SENSOR_NAME from '@salesforce/schema/Sensor__c.Name';
// import SENSOR_MODEL from '@salesforce/schema/Sensor__c.Sensor_model__c';
// import SENSOR_STATUS from '@salesforce/schema/Sensor__c.Status__c';
// import SENSOR_BASE_STATION from '@salesforce/schema/Sensor__c.Base_Station__r.Name';

const COLUMNS = [
    {label: 'Name', fieldName: 'Name'},
    {label: 'Model', fieldName: 'Sensor_model__c'},
    {label: 'Status', fieldName: 'Status__c'},
    {label: 'Base Station Name', fieldName: 'Base_Station__r__Name'},
]
export default class sensorManagement extends LightningElement {
    @api recordId;
    @track columns = COLUMNS;
    @track sensors;
    wiredRecords;
    @track error;
    @wire(getBaseStations) baseStations;

    @wire(getSensors) wiredSensors(result){
        if(result.data){
            this.error = undefined;
            this.wiredRecords = result.data;
            console.log(JSON.stringify(this.wiredRecords));
            let sensorArr = [];
            result.data.forEach(record => {
                let sensor = {};
                sensor.Name = record.Name;
                sensor.Sensor_model__c = record.Sensor_model__c;
                sensor.Status__c = record.Status__c;
                this.baseStations.data.forEach(element=>{
                    if(element.Id === record.Base_Station__c){
                        sensor.Base_Station__r__Name = element.Name;
                    }
                })
                sensorArr.push(sensor);
                console.log(sensorArr);
            });
            this.sensors = sensorArr;
           
        } else if (result.error){
            this.error = result.error;
            this.sensors = undefined;
        }

    };

    // @wire(getSensors)
    // sensors;
    // get errors(){
    //     return (this.error) ? reduceErrors(this.error) : [];
    // }

    downloadCSVHandler(event){
        const downloadFile = event.detail.files;

        readCSV({contentDocumentId : uploadedFiles[0].documentId})
        .then(result=> {
            window.console.log('result: '+ result);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Sensors were created according to the CSV file download',
                    variant: 'Success',
                }),
            );
        })
        .catch(error=>{
            window.console.log('error: '+ error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: JSON.stringify(error),
                    variant: 'error',
                }),
            );     
        })

    }

   
}