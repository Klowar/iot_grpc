import { sendUnaryData, ServerDuplexStream, ServerUnaryCall, ServerWritableStream } from "grpc";
import { ITemperatureServiceServer } from "../generated/proto/messages_grpc_pb";
import { GetAllByDeviceIdRequest, GetByIdRequest, SaveRequest, TemperatureRecord, TemperatureRecordResponse } from '../generated/proto/messages_pb';


export class TMPService implements ITemperatureServiceServer {

    private db: Map<number, TemperatureRecord>;

    constructor(db: Map<number, TemperatureRecord>) {
        this.db = db;
    }

    public getRecordById(call: ServerUnaryCall<GetByIdRequest>, callback: sendUnaryData<TemperatureRecordResponse>) {
        // Resp
        try {
            const record = this.db.get(call.request.getId());
            callback(null, new TemperatureRecordResponse().setRecord(record));
        } catch (e) {
            callback(e as Error, null);
        }
    };

    public getAllByDeviceId(call: ServerWritableStream<GetAllByDeviceIdRequest, TemperatureRecordResponse>) {
        // Resp
        try {
            const values = [...this.db.values()];
            for (const record of values)
                if (record.getDeviceid() == call.request.getDeviceid())
                    call.write(new TemperatureRecordResponse().setRecord(record));
        } catch (e) {
            call.write(e);
        }
        finally {
            call.end();
        }

    };

    public save(call: ServerUnaryCall<SaveRequest>, callback: sendUnaryData<TemperatureRecordResponse>) {
        // Resp
        try {
            if (!call.request.hasRecord()) callback(null, null);

            const record = call.request.getRecord();
            if (record != null) this.db.set(this.db.size, record.setId(this.db.size));

            callback(null, new TemperatureRecordResponse().setRecord(record));
        } catch (e) {
            callback(e, null);
        }
    }

    public saveAll(call: ServerDuplexStream<SaveRequest, TemperatureRecordResponse>) {
        // Resp
        try {
            call.on("data", (data: SaveRequest) => {
                if (!data.hasRecord()) return;
                const record = data.getRecord();
                if (record === undefined) return;
                this.db.set(this.db.size, record.setId(this.db.size));
                call.write(new TemperatureRecordResponse().setRecord(record));
            })
        } catch (e) {
            call.write(e);
            call.end();
        }
    }

}
