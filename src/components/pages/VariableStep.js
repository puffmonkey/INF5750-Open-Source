//@flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { find } from 'lodash'
import { List, ListItem } from 'material-ui/List'
import { generateJSONDataElements, generateJSONImportData } from '../../data/posting'
import BackButton from '../layout/BackButton'
import Checkbox from 'material-ui/Checkbox'
import Divider from 'material-ui/Divider'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import styles from '../../styles/pagestyle'
import TextField from 'material-ui/TextField'
import Loading from '../layout/Loading'

import type { DataElements, ImportData } from '../../types'

export class VariableStep extends Component{
	props: {
		countryName: string,
		countryCode: string,
		dataCategory: string,
		dataSelected: Array<number>,
		importResponse: ?Object,
		stepIndex: number,
		subCategory: Array<Object>,
		year: number,
		deselectData: (dataId: number) => void,
		receiptConfirmed: () => void,
		submitData: (dataElements: DataElements, importData: ImportData) => void,
		selectData: (dataId: number) => void,
		showPreviousStep: (stepIndex: number) => void,
	}

	state: {
		open: boolean,
		receiptReceived: boolean,
		inputVariable: string,
	}

	constructor() {
		super()
		this.state = {
			open: false,
			receiptReceived: false,
			inputVariable: '',
		}
	}
  handleOpen() {
    this.setState({open: true})
  }

	handleCanceled() {
		this.setState({open: false})
	}

  handleCloseAndImportData() {
    this.setState({open: false, receiptReceived: true})
		this.props.submitData(generateJSONDataElements(this.props.subCategory, this.props.dataSelected),
													generateJSONImportData(this.props.countryName, this.props.subCategory, this.props.dataSelected))
  }

	handleReceiptClose() {
		this.setState({receiptReceived: false})
		this.props.receiptConfirmed()
	}

	getUserInputVariable(event: any) {
		this.setState({ inputVariable: event.target.value })
	}

	filterVariables(subCategory: Array<Object>, input: string) {
		return subCategory.filter(data => data.Label.toLowerCase().startsWith(input.toLowerCase()))
											.map((data, index) =>
												<div key={index}>
													<ListItem key={data.DataId}
																		style={{fontFamily: 'sans-serif'}}
																		primaryText={data.Label}
																		secondaryText={data.Definition}
																		secondaryTextLines={2}
																		leftCheckbox={<Checkbox key={data.DataId}
																														style={{marginTop: 12}}
																														checked={this.props.dataSelected.includes(data.DataId)}
																														onCheck={(event: Object, isInputChecked: boolean) =>
																														isInputChecked ? this.props.selectData(data.DataId) : this.props.deselectData(data.DataId)}/>}/>
													<Divider/>
												</div>)
		}

	render() {
		const stepHeader = "Search data of " + this.props.dataCategory + " from " + this.props.countryName + " - " + this.props.year
		return (
			<div>
				<div style={styles.text}>
					<p>Select data of {this.props.dataCategory} from {this.props.countryName} - {this.props.year}</p>
				</div>
				<TextField
					hintText={stepHeader}
					fullWidth={true}
					value={this.state.inputVariable}
					onChange={(event) => this.getUserInputVariable(event)}
				/>
				<List>
					{this.filterVariables(this.props.subCategory, this.state.inputVariable)}
				</List>
				<div style={{display: 'flex', justifyContent: 'center'}}>
				<BackButton stepIndex={this.props.stepIndex} onClick={() => this.props.showPreviousStep(this.props.stepIndex)} />
				<RaisedButton style={{marginLeft:12}} secondary={true} disabled={this.props.dataSelected.length === 0} label="Import" onClick={() => this.handleOpen()} />
			</div>
				{this.state.open &&
					<ImportDialog open={this.state.open}
												countryName={this.props.countryName}
												dataSelected={this.props.dataSelected}
												handleCanceled={() => this.handleCanceled()}
												handleCloseAndImportData={() => this.handleCloseAndImportData()}
												subCategory={this.props.subCategory}
												year={this.props.year}/>}

				{this.state.receiptReceived &&
					<ReceiptDialog open={this.state.receiptReceived}
												 response={this.props.importResponse}
												 countryName={this.props.countryName}
												 handleClose={() => this.handleReceiptClose()}
												 subCategory={this.props.subCategory}
												 year={this.props.year}/>}
			</div>
		)
	}
}


const ReceiptDialog = ({open, response, handleClose, subCategory, countryName, year}) => {
	return (<Dialog
		title={createTitle(countryName, year)}
		actions={
      <FlatButton label="Ok"
        					primary={true}
        					onClick={() => handleClose()}/>}
		modal={false}
		open={open}
		onRequestClose={() => handleClose}
		autoScrollBodyContent={true}>
		{response ? <p>Successfully imported {response.imported} data value(s).</p> : <Loading/>}
	</Dialog>)
}

function createTitle(countryName: string, year: number) {
	return "Data selected from " + countryName + " - " + year
}

const ImportDialog = ({open, handleCanceled, handleCloseAndImportData, dataSelected, subCategory, countryName, year}) => {
	return (<Dialog
		title={createTitle(countryName, year)}
		actions={[<FlatButton
			label="Cancel"
			primary={true}
			onClick={() => handleCanceled()}
		/>,
		<RaisedButton
			label="Submit"
			secondary={true}
			onClick={() => handleCloseAndImportData()}
		/>,
	]}
		modal={false}
		open={open}
		onRequestClose={handleCanceled}
		autoScrollBodyContent={true}
	>
		<List>
		{dataSelected.map((dataId, index) => {
			const matchedDataObject = find(subCategory, subData => subData.DataId === dataId)
			return (<ListItem key={index} primaryText={matchedDataObject.Label} />)
			})}
		</List>
	</Dialog>
)}

const mapStateToProps = (state) => ({
	countryName: state.survey.countryName,
	dataCategory: state.survey.dataCategory,
	dataSelected: state.survey.data,
	importResponse: state.fetching.importResponse,
	subCategory: state.survey.subCategory,
	stepIndex: state.routing.stepIndex,
	year: state.survey.year
})

const mapDispatchToProps = (dispatch) => ({
	deselectData: (dataId: number) => dispatch({ type: 'DATA_DESELECTED', dataId: dataId }),
	receiptConfirmed: () => dispatch({ type: 'RECEIPT_CONFIRMED'}),
	selectData: (dataId: number) => dispatch({ type: 'DATA_SELECTED', dataId: dataId }),
	showPreviousStep: (stepIndex: number) => dispatch({ type: 'PREVIOUS_PAGE_REQUESTED', stepIndex: stepIndex }),
	submitData: (dataElements: DataElements, importData: ImportData) => dispatch({ type: 'DATA_IMPORT_REQUESTED', dataElements: dataElements, importData: importData })
 })

const ConnectedPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(VariableStep)

export default ConnectedPage
