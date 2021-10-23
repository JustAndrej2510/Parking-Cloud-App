public with sharing class SensorManagementController {
    public virtual class BaseException extends Exception {}
    public class SensorDeleteException extends BaseException {}
    public class DocumentDownloadException extends BaseException {}

    @AuraEnabled
    public static List<Sensor__c> readCSVData(Id contentDocumentId){
        List<Sensor__c> sensorList = new List<Sensor__c>();
        try {
            if(contentDocumentId != null){
                ContentVersion contentVersionObj = [SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId =:contentDocumentId];
                List<String> csvRecordList = contentVersionObj.VersionData.toString().split('\n');
                List<Base_Station__c> stations =  [SELECT Id, Name FROM Base_Station__c Order by Name];
                for(Integer i = 1; i < csvRecordList.size(); i++){
                    List<String> csvRowList = csvRecordList[i].split(',');
                    Sensor__c newSensor = new Sensor__c();
                    if(csvRowList[0].trim() == null || csvRowList[0].trim() == ''){
                        throw new DocumentDownloadException('Sensor model field cannot be empty.');
                    }
                    if(csvRowList[1].trim() != 'Active' && csvRowList[1].trim() != 'Inactive'){
                        throw new DocumentDownloadException('Invalid Status. Status must be Active or Inactive');
                    }
                    newSensor.Sensor_model__c = csvRowList[0];
                    newSensor.Status__c = csvRowList[1];
                    if(csvRowList[2].trim() != null){
                        for(Base_Station__c station : stations){
                            if(station.Name == csvRowList[2].trim()){
                               newSensor.Base_Station__c = station.Id;
                            }
                        }
                    }
                    sensorList.add(newSensor);
                }
                if(sensorList.isEmpty()){
                    throw new DocumentDownloadException('Document is Empty');
                }
                else{
                    insert sensorList;
                }
            }
            else{
                throw new DocumentDownloadException('No dowloaded files');
            }
        } 
        catch(DocumentDownloadException ex){
            throw new AuraHandledException(ex.getMessage());
        }
        catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }

        return sensorList;
    }

    // private static List<Sensor__c> checkCSVData(List<String> csvRecordList){
    //     try{
            

    //     }
    //     catch(DocumentDownloadException ex){
    //         throw new AuraHandledException(ex.getMessage());
    //     }
    //     catch (Exception ex) {
    //         throw new AuraHandledException(ex.getMessage());
    //     }

        
    // }

    @AuraEnabled
    public static void deleteSensor(Id sensorId){
        try{
            System.debug(sensorId);
            if(sensorId!=null){
                Sensor__c sensor = new Sensor__c(Id = sensorId);
                delete sensor;
            }
            else{
                throw new SensorDeleteException('No found selected sensor id');
            }
        }
        catch(SensorDeleteException ex){
            throw new AuraHandledException(ex.getMessage());
        }
        catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }

    @AuraEnabled(cacheable = true)
    public static List<Sensor__c> getSensors(Integer tableOffset, Integer tableSize){
        return [SELECT Id, Name, Sensor_Model__c, Status__c, Base_Station__c, Base_Station__r.Name FROM Sensor__c LIMIT :tableSize OFFSET :tableOffset ];
    }

    @AuraEnabled(cacheable = true)
    public static Integer getCountSensors(){
        return [SELECT COUNT() FROM Sensor__c];
    }

}