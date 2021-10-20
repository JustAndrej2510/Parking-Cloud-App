import { LightningElement, api, track, wire } from 'lwc';
//import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
import readCSV from '@salesforce/apex/SensorManagementController.readCSVData';
import getSensors from '@salesforce/apex/SensorManagementController.getSensors';
import getBaseStations from '@salesforce/apex/SensorManagementController.getBaseStations';
import deleteSelectedSensors from '@salesforce/apex/SensorManagementController.deleteSelectedSensors';
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
    @track sensors;
    @track error;
    @track selectedSensorsCount = 0;
    selectedSensors = [];
    columns = COLUMNS;
    wiredData;

    @wire(getBaseStations) baseStations;
    @wire(getSensors) wiredSensors(result){
        this.wiredData = result.data;
        if(result.data){
            this.error = undefined;
            //console.log(JSON.stringify(this.wiredRecords));
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
                //console.log(sensorArr);
            });
            this.sensors = sensorArr;
           
        } else if (result.error){
            this.error = result.error;
            this.sensors = undefined;
        }

    };
    // get errors(){
    //     return (this.error) ? reduceErrors(this.error) : [];
    // }

    downloadCSVHandler(event){
        const downloadFiles = event.detail.files;
        console.log('fileId: ' + downloadFiles[0].documentId);
        readCSV({contentDocumentId : downloadFiles[0].documentId})
        .then(result=> {
            console.log('result: ' + result);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Sensors were created according to the CSV file download',
                    variant: 'Success',
                }),
            );
            return refreshApex(this.wiredData);
        })
        .catch(error=>{
            console.log('error: ' + error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: JSON.stringify(error),
                    variant: 'Error',
                }),
            );     
        })

    }

    getSelectedRecords(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedSensorsCount = event.detail.selectedRows.length;
        let selectedRowNames = [];
        for (let i = 0; i < selectedRows.length; i++) {
            selectedRowNames.push(selectedRows[i].Name);
            window.console.log('SelectedRows: ' + selectedRowNames[i]);
        }
        this.copySelectedRows(selectedRowNames);
        // for(let j = 0; j < this.selectedSensors.length; j++){
        //     window.console.log('Arr: ' + selectedSensors[j]);
        // }
    }

    copySelectedRows(arr){
        this.selectedSensors = arr.slice();
        window.console.log(this.selectedSensors);
    }

    deleteSensors(){
        deleteSelectedSensors({sensorNameList : this.selectedSensors})
        .then(result=>{
            window.console.log('result: ' + result);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success', 
                    message: this.selectedSensorsCount + ' Sensors were deleted ', 
                    variant: 'Success'
                }),
            );
            this.template.querySelector('lightning-datatable').selectedRows = [];
            this.selectedSensorsCount = 0;
            this.selectedSensors = [];
            return refreshApex(this.wiredData);
        })
        .catch(error=>{
            window.console.log('error: ' + error.data);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: JSON.stringify(error),
                    variant: 'Error',
                }),
            );     
        })

    }
}