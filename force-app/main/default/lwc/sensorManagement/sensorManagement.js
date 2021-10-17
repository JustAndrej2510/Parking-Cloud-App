import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SENSOR_NAME from '@salesforce/schema/Sensor__c.Name';
import SENSOR_MODEL from '@salesforce/schema/Sensor__c.Sensor_model__c';
import SENSOR_STATUS from '@salesforce/schema/Sensor__c.Status__c';
import SENSOR_BASE_STATION from '@salesforce/schema/Sensor__c.Base_Station__c';

const COLUMNS = [
    {lable: 'Name', fieldName: SENSOR_NAME.fieldApiName, type: "text"},
    {lable: 'Model', fieldName: SENSOR_MODEL.fieldApiName, type: "text"},
    {lable: 'Status', fieldName: SENSOR_STATUS.fieldApiName, type: "text"},
    {lable: 'Base Station', fieldName: SENSOR_BASE_STATION.fieldApiName, type: "text"},
]
export default class ParkingCloudUserPage extends LightningElement {
    @api recordId;

    columns = COLUMNS;
    downloadCSVHandler(){

    }
}