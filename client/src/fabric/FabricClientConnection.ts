/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
'use strict';
import {
    loadFromConfig
} from 'fabric-client';
import * as fs from 'fs';
import { FabricConnection } from './FabricConnection';

const ENCODING = 'utf8';

export class FabricClientConnection extends FabricConnection {

    private connectionProfilePath: string;
    private certificatePath: string;
    private privateKeyPath: string;

    constructor(connectionData) {
        super();
        this.connectionProfilePath = connectionData.connectionProfilePath;
        this.certificatePath = connectionData.certificatePath;
        this.privateKeyPath = connectionData.privateKeyPath;
    }

    async connect(): Promise<void> {
        console.log('connect');
        this.client = await loadFromConfig(this.connectionProfilePath);
        const mspid: string = this.client.getMspid();
        const certString: string = this.loadFileFromDisk(this.certificatePath);
        const privateKeyString: string = this.loadFileFromDisk(this.privateKeyPath);
        // TODO: probably need to use a store rather than this as not every config will be an admin
        this.client.setAdminSigningIdentity(privateKeyString, certString, mspid);

    }

    private loadFileFromDisk(path: string): string {
        console.log('loadFileFromDisk', path);
        return fs.readFileSync(path, ENCODING) as string;
    }

}
