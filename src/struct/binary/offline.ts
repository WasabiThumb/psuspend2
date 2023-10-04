import {SuspendBinary, SuspendBinaryBuilder, SuspendBinaryProvider} from "../binary";
import {OfflineSuspendBinaryComponents} from "./offline/magic"; // BIG
import { Readable } from "stream";
import { once } from "events";

const OfflineSuspendBinaryProvider: SuspendBinaryProvider = {

    async get(): Promise<SuspendBinary> {
        const builder: SuspendBinaryBuilder = await SuspendBinaryBuilder.create();
        for (let component of OfflineSuspendBinaryComponents) {
            const ws = builder.write(component.type, component.fileName);

            const buf = Buffer.from(component.data, 'base64');
            const rs: Readable = new Readable();
            rs.push(buf);
            rs.push(null);

            rs.pipe(ws);
            await once(rs, "end");
        }
        return builder.build();
    }

};

export default OfflineSuspendBinaryProvider;
