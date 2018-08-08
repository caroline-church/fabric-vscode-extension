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
import * as vscode from 'vscode';
import { showConnectionQuickPickBox } from './util';
import { showIdentityConnectionQuickPickBox } from './util';
import { FabricClientConnection } from '../fabricClientConnection';
import { ParsedCertificate } from '../parsedCertificate';
import { connect } from './connectCommand';
import { showPeerQuickPickBox } from './util';

export async function installChaincode(peerName: string, fabricClientConnection: FabricClientConnection): Promise<void> {
    console.log('installChaincode', [peerName, fabricClientConnection]);

    if(!fabricClientConnection) {
        try {
         const fabricClient: FabricClientConnection | void = await connect();
         if(fabricClient) {
             fabricClientConnection = fabricClient;
         } else {
             // They cancelled so just return
             return;
         }
        } catch(error) {
            vscode.window.showErrorMessage('Could not install chaincode as could not connect, see other messages for details');
            return;
        }

        peerName = await showPeerQuickPickBox('Choose a peer to install the chaincode on', fabricClientConnection);
        if(!peerName) {
            return;
        }
    }
    try {
        const path: string = 'TODO: let user choose from packages'
    await fabricClientConnection.installChaincode(path, peerName);
    } catch(error) {
        console.log(error);
    }

    
}