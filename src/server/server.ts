import { Server, ServerCredentials } from 'grpc';
import { TemperatureServiceService } from '../generated/proto/messages_grpc_pb';
import { TemperatureRecord } from '../generated/proto/messages_pb';
import { TMPService } from './service';


const db: TemperatureRecord.AsObject[] = require("./db.json");

function main() {
    var server = new Server();
    const dbMap: [number, TemperatureRecord][] = db.map(_ => [_.id, new TemperatureRecord().setId(_.id).setDeviceid(_.deviceid).setTime(_.time).setValue(_.value)]);

    server.addService(TemperatureServiceService, new TMPService(new Map(dbMap)));
    server.bindAsync('0.0.0.0:50051', ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();