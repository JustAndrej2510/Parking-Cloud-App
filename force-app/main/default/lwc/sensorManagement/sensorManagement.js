import { LightningElement, wire, track, api } from 'lwc';
//import { reduceErrors } from 'c/ldsUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
import readCSV from '@salesforce/apex/SensorManagementController.readCSVData';
import getSensors from '@salesforce/apex/SensorManagementController.getSensors';
import getCountSensors from '@salesforce/apex/SensorManagementController.getCountSensors';
import deleteSensor from '@salesforce/apex/SensorManagementController.deleteSensor';

const ACTIONS = [
    { label: 'Delete', name: 'delete' },
];

const COLUMNS = [
    {label: 'Name', fieldName: 'Name', sortable: "true"},
    {label: 'Model', fieldName: 'Sensor_model__c', sortable: "true"},
    {label: 'Status', fieldName: 'Status__c', sortable: "true"},
    {label: 'Base Station Name', fieldName: 'Base_Station__r__Name', sortable: "true"},
    {
        type: 'action',
        typeAttributes: { rowActions: ACTIONS },
    },
];

export default class sensorManagement extends LightningElement {
    @api recordId;
    @track sensors;
    @track tableSize = 10;
    @track tableOffset = 0;
    @track page = 1;
    @track error;
    @track countSensors;
    @track sortBy;
    @track sortDirection;

    columns = COLUMNS;
    wiredData;

    connectedCallback() {
        getCountSensors().then(result=>{
            this.countSensors = result;
        });
    }

    handleRowAction(event){
        const sensor = event.detail.row;
        this.deleteSelectedSensor(sensor.Id, sensor.Name);
    }

    handleSort(event){
        this.sortBy = event.detail.fieldName;       
        this.sortDirection = event.detail.sortDirection;       
        this.sortSensorData(event.detail.fieldName, event.detail.sortDirection);
    }

    sortSensorData(fieldName, direction) {
        let parseData = JSON.parse(JSON.stringify(this.sensors));
        let keyValue = (k) => {
            return k[fieldName];
        };
        
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
           
            return isReverse * ((x > y) - (y > x));
        });
        
        this.sensors = parseData;
    }


    @api
    get amountPages(){
        return Math.ceil(this.countSensors / this.tableSize); 
    }

    @wire(getSensors, {tableOffset : '$tableOffset', tableSize : '$tableSize'}) wiredSensors(result){
        this.wiredData = result.data;
        if(result.data){
            this.error = undefined;
            //console.log(JSON.stringify(this.wiredRecords));
            let sensorArr = [];
            result.data.forEach(record => {
                console.log("Sensor info: " + JSON.stringify(record));
                let sensor = {};
                sensor.Id = record.Id;
                sensor.Name = record.Name;
                sensor.Sensor_model__c = record.Sensor_model__c;
                sensor.Status__c = record.Status__c;
                sensor.Base_Station__c = record.Base_Station__c;
                if(sensor.Base_Station__c !=null){
                    sensor.Base_Station__r__Name = record.Base_Station__r.Name;
                }
                sensorArr.push(sensor);
                console.log(sensorArr);
            });
            this.sensors = sensorArr;

        } else if (result.error){
            this.error = result.error;
            this.sensors = undefined;
        }

    };

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

    deleteSelectedSensor(selectedSensorId, selectedSensorName){
        deleteSensor({sensorId : selectedSensorId})
        .then(result=>{
            console.log('result: ' + result);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success', 
                    message: 'Sensor number ' + selectedSensorName + ' was successfully deleted ', 
                    variant: 'Success'
                }),
            );
            return refreshApex(this.wiredData);
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