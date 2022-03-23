declare module "@salesforce/apex/SensorManagementController.readCSVData" {
  export default function readCSVData(param: {contentDocumentId: any}): Promise<any>;
}
declare module "@salesforce/apex/SensorManagementController.deleteSensor" {
  export default function deleteSensor(param: {sensorId: any}): Promise<any>;
}
declare module "@salesforce/apex/SensorManagementController.getSensors" {
  export default function getSensors(param: {tableOffset: any, tableSize: any}): Promise<any>;
}
declare module "@salesforce/apex/SensorManagementController.getCountSensors" {
  export default function getCountSensors(): Promise<any>;
}
