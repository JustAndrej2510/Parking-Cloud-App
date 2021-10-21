import { LightningElement, api, track, wire } from 'lwc';
//import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
import readCSV from '@salesforce/apex/SensorManagementController.readCSVData';
import getSensors from '@salesforce/apex/SensorManagementController.getSensors';
import getBaseStations from '@salesforce/apex/SensorManagementController.getBaseStations';
import getCountSensors from '@salesforce/apex/SensorManagementController.getCountSensors';
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
    @track selectedSensorsCount = 0;
    @track tableSize = 10;
    @track tableOffset = 0;
    @track countSensors;
    @track error;
    @track page = 1;
    selectedSensors = [];
    columns = COLUMNS;
    wiredData;

    connectedCallback() {
        getCountSensors().then(result=>{
            this.countSensors = result;
        });
    }

    @api
    get amountPages(){
        return Math.ceil(this.countSensors / this.tableSize); 
    }

    //@wire(getBaseStations) baseStations;
    @wire(getSensors, {tableOffset : '$tableOffset', tableSize : '$tableSize'}) wiredSensors(result){
        this.wiredData = result.data;
        if(result.data){
            this.error = undefined;
            //console.log(JSON.stringify(this.wiredRecords));
            let sensorArr = [];
            result.data.forEach(record => {
                console.log("Sensor info: " + JSON.stringify(record));
                var sensor = {};
                sensor.Name = record.Name;
                sensor.Sensor_model__c = record.Sensor_model__c;
                sensor.Status__c = record.Status__c;
                if(record.Base_Station__c !=null){
                    sensor.Base_Station__r__Name = this.fetchBaseStations(record.Base_Station__c);
                }
                
                // this.baseStations.data.forEach(element=>{
                //     if(element.Id === record.Base_Station__c){
                //         sensor.Base_Station__r__Name = element.Name;
                //     }
                // })
                sensorArr.push(sensor);
                console.log(sensorArr);
            });
            this.sensors = sensorArr;
           
        } else if (result.error){
            this.error = result.error;
            this.sensors = undefined;
        }

    };

    fetchBaseStations(stationId){
        let name;
        getBaseStations()
        .then(stations=>{
            //console.log(stations);
            stations.forEach(element=>{
                if(element.Id === stationId){
                    //console.log(element.Name);
                    name = element.Name;
                }
            })
        })
        return name;
    }

    get errors(){
        return (this.error) ? reduceErrors(this.error) : [];
    }

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
            return refreshApex(this.sensors);
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
            console.log('SelectedRows: ' + selectedRowNames[i]);
        }
        this.copySelectedRows(selectedRowNames);
    }

    copySelectedRows(arr){
        this.selectedSensors = arr.slice();
        console.log(this.selectedSensors);
    }

    deleteSensors(){
        deleteSelectedSensors({sensorNameList : this.selectedSensors})
        .then(result=>{
            console.log('result: ' + result);
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
            return refreshApex(this.sensors);
        })
        .catch(error=>{
            console.log('error: ' + JSON.stringify(error));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'Error',
                }),
            );     
        })
    }

    //---Pagination---

    handleSelectChange(event){
        this.tableSize = Number(event.detail);
        this.tableOffset = 0;
        this.page = 1;
        if(this.tableSize >= this.countSensors){
            this.template.querySelector('c-pagination').hanldeChangeView('previousDisable');
            this.template.querySelector('c-pagination').hanldeChangeView('nextDisable');
        }
        else{
            this.template.querySelector('c-pagination').hanldeChangeView('nextEnable');
            this.template.querySelector('c-pagination').hanldeChangeView('previousDisable');
        }
    }

    handlePrevious(){
        this.tableOffset -= this.tableSize;
        this.page--;
        if(this.tableOffset === 0){
            this.template.querySelector('c-pagination').hanldeChangeView('previousDisable');
            this.template.querySelector('c-pagination').hanldeChangeView('nextEnable');
        }
        else{
            //this.template.querySelector('c-pagination').hanldeChangeView('previousEnable');
            this.template.querySelector('c-pagination').hanldeChangeView('nextEnable');
        }
    }

    handleNext(){
        this.tableOffset += this.tableSize;
        this.page++;
        console.log('Offset: ' + this.tableOffset);
        console.log('Size: ' + this.tableSize);
        console.log('Count: ' + this.countSensors);

        if(this.tableOffset + this.tableSize > this.countSensors){
            this.template.querySelector('c-pagination').hanldeChangeView('nextDisable');
            this.template.querySelector('c-pagination').hanldeChangeView('previousEnable');
        }
        else{
            //this.template.querySelector('c-pagination').hanldeChangeView('nextEnable');
            this.template.querySelector('c-pagination').hanldeChangeView('previousEnable');
        }
    }

    handleFirst(){
        this.tableOffset = 0;
        this.page = 1;
        this.template.querySelector('c-pagination').hanldeChangeView('previousDisable');
        this.template.querySelector('c-pagination').hanldeChangeView('nextEnable');
    }

    handleLast(){
        this.tableOffset = this.countSensors - (this.countSensors)%(this.tableSize);
        this.page = this.amountPages;
        this.template.querySelector('c-pagination').hanldeChangeView('nextDisable');
        this.template.querySelector('c-pagination').hanldeChangeView('previousEnable');
    }






}