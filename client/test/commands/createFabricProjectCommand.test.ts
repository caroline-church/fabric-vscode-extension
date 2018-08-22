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
import * as path from 'path';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as tmp from 'tmp';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
import * as fs from 'fs';
import * as util from 'util';
import { CommandUtil } from '../../src/util/CommandUtil';
import { ExtensionUtil } from '../../src/util/ExtensionUtil';
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);

// Defines a Mocha test suite to group tests of similar kind together
// tslint:disable no-unused-expression
describe('CreateFabricProjectCommand', () => {
    // suite variables
    let mySandBox: sinon.SinonSandbox;
    let sendCommandStub: sinon.SinonStub;
    let errorSpy: sinon.SinonSpy;
    let quickPickStub: sinon.SinonStub;
    let openDialogStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;
    let uri: vscode.Uri;
    let uriArr: Array<vscode.Uri>;

    beforeEach(async () => {
        await ExtensionUtil.activateExtension();
        mySandBox = sinon.createSandbox();
        sendCommandStub = mySandBox.stub(CommandUtil, 'sendCommand');
        errorSpy = mySandBox.spy(vscode.window, 'showErrorMessage');
        quickPickStub = mySandBox.stub(vscode.window, 'showQuickPick');
        openDialogStub = mySandBox.stub(vscode.window, 'showOpenDialog');
        const originalExecuteCommand = vscode.commands.executeCommand;
        executeCommandStub = mySandBox.stub(vscode.commands, 'executeCommand');
        executeCommandStub.callsFake(async function fakeExecuteCommand(command: string) {
            // Don't open the folder as this causes lots of windows to pop up, and random
            // test failures.
            if (command !== 'vscode.openFolder') {
                return originalExecuteCommand.apply(this, arguments);
            }
        });
        uri = vscode.Uri.file(tmp.dirSync().name);
        uriArr = [uri];
    });
    afterEach(() => {
        mySandBox.restore();
    });

    // Define assertion
    it('should start a fabric project', async () => {
        // We actually want to execute the command!
        sendCommandStub.restore();
        try {
            await mkdir(uri.fsPath);
        } catch (error) {
            if (!error.message.includes('file already exists') ) {
                throw new error('failed to create test directory:' + uri.fsPath);
            }
        }
        openDialogStub.resolves(uriArr);

        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        // check package.json has been created
        const pathToCheck = path.join(uri.fsPath, 'package.json');
        chai.assert(exists(pathToCheck), 'No package.json found, looking here:' + pathToCheck);
        executeCommandStub.should.have.been.calledTwice;
        executeCommandStub.should.have.been.calledWith('vscode.openFolder', uriArr[0], true);

    }).timeout(20000);

    it('should show error if npm is not installed', async () => {
        // npm not installed
        sendCommandStub.onCall(0).rejects();
        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        errorSpy.should.have.been.calledWith('npm is required before creating a fabric project');
    });

    it('should show error is yo is not installed and not wanted', async () => {
        // yo not installed and not wanted
        sendCommandStub.onCall(0).rejects({message : 'npm ERR'});
        quickPickStub.resolves('no');
        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        errorSpy.should.have.been.calledWith('npm modules: yo and generator-fabric are required before creating a fabric project');
    });

    it('should show error message if generator-fabric fails to install', async () => {
        // generator-fabric not installed and wanted but fails to install
        sendCommandStub.onCall(0).resolves();
        sendCommandStub.onCall(1).rejects();
        quickPickStub.resolves('yes');
        openDialogStub.resolves(uriArr);
        sendCommandStub.onCall(2).rejects();
        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        errorSpy.should.have.been.calledWith('Issue installing generator-fabric module');
    });

    it('should show error message if yo fails to install', async () => {
        // yo not installed and wanted but fails to install
        sendCommandStub.onCall(0).rejects({message : 'npm ERR'});
        quickPickStub.resolves('yes');
        openDialogStub.resolves(uriArr);
        sendCommandStub.onCall(1).rejects();
        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        errorSpy.should.have.been.calledWith('Issue installing yo node module');
    });

    it('should show error message if we fail to create a smart contract', async () => {
        // generator-fabric and yo not installed and wanted
        sendCommandStub.onCall(0).rejects({message : 'npm ERR'});
        quickPickStub.resolves('yes');
        openDialogStub.resolves(uriArr);
        // npm install works
        sendCommandStub.onCall(1).resolves();
        sendCommandStub.onCall(2).resolves();
        // issue installing yo fabric should show an error
        sendCommandStub.onCall(3).rejects();
        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        errorSpy.should.have.been.calledWith('Issue creating fabric project');
    });

    it('should should not do anything if the user cancels the open dialog', async () => {
        // We actually want to execute the command!
        sendCommandStub.restore();
        openDialogStub.resolves(undefined);
        await vscode.commands.executeCommand('blockchain.createFabricProjectEntry');
        openDialogStub.should.have.been.calledOnce;
        executeCommandStub.should.have.been.calledOnce;
        executeCommandStub.should.have.not.been.calledWith('vscode.openFolder');
    });

}); // end of createFabricCommand tests
