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
import * as myExtension from '../../src/extension';

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { PackageTreeItem } from '../../src/explorer/model/PackageTreeItem';
import { ExtensionUtil } from '../../src/util/ExtensionUtil';

chai.use(sinonChai);
const should = chai.should();

// tslint:disable no-unused-expression
describe('BlockchainPackageExplorer', () => {
    let mySandBox;
    let rootPath: string;

    beforeEach(async () => {
        mySandBox = sinon.createSandbox();
        rootPath = path.dirname(__dirname);

        await ExtensionUtil.activateExtension();
    });

    afterEach(() => {
        mySandBox.restore();
    });

    it('should show smart contract packages in the BlockchainPackageExplorer view', async () => {
        const packagesDir: string = path.join(rootPath, '../../test/data/smartContractDir');
        await vscode.workspace.getConfiguration().update('fabric.package.directory', packagesDir, true);

        const blockchainPackageExplorerProvider = myExtension.getBlockchainPackageExplorerProvider();
        const testPackages: Array<PackageTreeItem> = await blockchainPackageExplorerProvider.getChildren();

        testPackages.length.should.equal(4);
        testPackages[0].label.should.equal('smartContractPackageBlue'); // purposefully doesn't contain package.json
        testPackages[1].label.should.equal('smartContractPackageGreen - v00.01.555');
        testPackages[2].label.should.equal('smartContractPackagePurple - v91.836.0');
        testPackages[3].label.should.equal('smartContractPackageYellow');

    });
    it('should refresh the smart contract packages view when refresh is called', async () => {
        const blockchainPackageExplorerProvider = myExtension.getBlockchainPackageExplorerProvider();
        const onDidChangeTreeDataSpy = mySandBox.spy(blockchainPackageExplorerProvider['_onDidChangeTreeData'], 'fire');

        await vscode.commands.executeCommand('blockchainAPackageExplorer.refreshEntry');
        onDidChangeTreeDataSpy.should.have.been.called;
    });

    it('should show an error if it can\'t open the smart contract directory', async () => {
        const packagesDir: string = path.join(rootPath, '../../test/data/cake');
        await vscode.workspace.getConfiguration().update('fabric.package.directory', packagesDir, true);

        const errorSpy = mySandBox.spy(vscode.window, 'showErrorMessage');
        const blockchainPackageExplorerProvider = myExtension.getBlockchainPackageExplorerProvider();
        await blockchainPackageExplorerProvider.getChildren();
        errorSpy.should.have.been.called;
    });

    it('should get a tree item in BlockchainPackageExplorer', async () => {
        const packagesDir: string = path.join(rootPath, '../../test/data/smartContractDir');
        await vscode.workspace.getConfiguration().update('fabric.package.directory', packagesDir, true);

        const blockchainPackageExplorerProvider = myExtension.getBlockchainPackageExplorerProvider();
        const testPackages: Array<PackageTreeItem> = await blockchainPackageExplorerProvider.getChildren();

        const firstTestPackage: PackageTreeItem = blockchainPackageExplorerProvider.getTreeItem(testPackages[0]) as PackageTreeItem;

        firstTestPackage.label.should.equal('smartContractPackageBlue');
        firstTestPackage.tooltip.should.equal('smartContractPackageBlue');
    });
});
