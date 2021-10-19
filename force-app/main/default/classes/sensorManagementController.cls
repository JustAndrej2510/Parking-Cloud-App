public with sharing class sensorManagementController {
    @AuraEnabled
    public static List<Sensor__c> readCSVData(Id contentDocumentId){
        List<Sensor__c> sensorList = new List<Sensor__c>();
        try {
            if(contentDocumentId != null){
                ContentVersion contentVersionObj = [SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId];
                List<String> csvRecordList = contentVersionObj.VersionData.toString().split('\n');
                for(Integer i = 1; i < csvRecordList.size(); i++){
                    Sensor__c newSensor = new Sensor__c();
                    List<String> csvRowList = csvRecordList[i].split(',');
                    System.debug('csvRow: '+ csvRowList);
                    newSensor.Sensor_model__c = csvRowList[0];
                    newSensor.Status__c = csvRowList[1];
                    for(Base_Station__c station : getBaseStations()){
                        System.debug('csvRowList[2]: ' + csvRowList[2]);
                        if(station.Name == csvRowList[2].trim()){
                            newSensor.Base_Station__c = station.Id;
                        }
                    }
                    //newSensor.Base_Station__c = csvRowList[2];
                    sensorList.add(newSensor);
                }
                
                if(!sensorList.isEmpty()) {
                    insert sensorList;
                }
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return sensorList;
    }

    @AuraEnabled(cacheable = true)
    public static List<Sensor__c> getSensors(){
        return [SELECT Name, Sensor_Model__c, Status__c, Base_Station__c, Base_Station__r.Name FROM Sensor__c ORDER BY Name];
    }

    @AuraEnabled(cacheable = true)
    public static List<Base_Station__c> getBaseStations(){
        return [SELECT Name FROM Base_Station__c ORDER BY Name];
    }
}
