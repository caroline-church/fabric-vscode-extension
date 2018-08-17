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

import * as fs from 'fs';
import { FabricConnection } from './FabricConnection';
import { promisify } from 'util';

const ENCODING = 'utf8';
const readFile = promisify(fs.readFile);

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
        const connectionProfileContents = await readFile(this.connectionProfilePath, ENCODING);
        const connectionProfile = JSON.parse(connectionProfileContents);
        const certificate: string = await this.loadFileFromDisk(this.certificatePath);
        const privateKey: string = await this.loadFileFromDisk(this.privateKeyPath);
        await this.connectInner(connectionProfile, certificate, privateKey);
    }

    private async loadFileFromDisk(path: string): Promise<string> {
        console.log('loadFileFromDisk', path);
        return readFile(path, ENCODING);
    }

}
