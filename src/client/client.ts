import { credentials } from '@grpc/grpc-js';
import { TemperatureServiceClient } from '../generated/proto/messages_grpc_pb';
import { GetAllByDeviceIdRequest, GetByIdRequest, SaveRequest, TemperatureRecord } from '../generated/proto/messages_pb';

function getRecordById(client: TemperatureServiceClient) {
    return new Promise((res) => {

        const idRequest = new GetByIdRequest().setId(0);

        client.getRecordById(idRequest, (err, resp) => {
            if (err) return console.error(err);
            console.info("getRecordById Response", resp);
            client.close();
            res(resp);
        });
    })
}

async function getAllByDeviceId(client: TemperatureServiceClient) {
    const getDeviceIdRequest = new GetAllByDeviceIdRequest().setDeviceid(0);

    return new Promise((res,) => {
        const stream = client.getAllByDeviceId(getDeviceIdRequest);
        stream.addListener("error", (err) => console.error(err));
        stream.addListener("data", (data) => console.info("getAllByDeviceId Response", data));
        stream.addListener("end", () => { stream.removeAllListeners(); client.close(); res("") });
    });
}

function save(client: TemperatureServiceClient) {
    return new Promise((res) => {

        const record = new TemperatureRecord().setDeviceid(99).setTime(new Date().toISOString()).setValue(10.1);
        const saveRequest = new SaveRequest().setRecord(record);

        client.save(saveRequest, (err, resp) => {
            if (err) return console.error(err);
            console.info("save Response", resp);
            client.close();
            res(resp);
        });
    })
}

async function saveAll(client: TemperatureServiceClient) {
    const requests = [
        new TemperatureRecord().setDeviceid(99).setTime(new Date().toISOString()).setValue(12.1),
        new TemperatureRecord().setDeviceid(99).setTime(new Date().toISOString()).setValue(13.1),
        new TemperatureRecord().setDeviceid(99).setTime(new Date().toISOString()).setValue(14.1),
        new TemperatureRecord().setDeviceid(98).setTime(new Date().toISOString()).setValue(15.1),
        new TemperatureRecord().setDeviceid(98).setTime(new Date().toISOString()).setValue(16.1),
        new TemperatureRecord().setDeviceid(98).setTime(new Date().toISOString()).setValue(17.1),
        new TemperatureRecord().setDeviceid(97).setTime(new Date().toISOString()).setValue(18.1),
        new TemperatureRecord().setDeviceid(97).setTime(new Date().toISOString()).setValue(19.1),
        new TemperatureRecord().setDeviceid(97).setTime(new Date().toISOString()).setValue(20.1),
        new TemperatureRecord().setDeviceid(96).setTime(new Date().toISOString()).setValue(13.1)
    ].map((_) => new SaveRequest().setRecord(_));

    return new Promise((res) => {
        const duplexStream = client.saveAll();
        duplexStream.on("data", (data) => console.info("saveAll Response", data));
        duplexStream.on("end", () => { 
            duplexStream.removeAllListeners(); 
            client.close();
            res("saveAll") 
        });

        for (const item of requests)
            duplexStream.write(item);
        duplexStream.end();
    });
}

async function main() {
    // Read one
    await getRecordById(new TemperatureServiceClient("127.0.0.1:50051", credentials.createInsecure()));
    // Read multiple
    await getAllByDeviceId(new TemperatureServiceClient("127.0.0.1:50051", credentials.createInsecure()));
    // Save one
    await save(new TemperatureServiceClient("127.0.0.1:50051", credentials.createInsecure()));
    // Save multiple
    await saveAll(new TemperatureServiceClient("127.0.0.1:50051", credentials.createInsecure()));
}

main();