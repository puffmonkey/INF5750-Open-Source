//@flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { List } from 'material-ui/List'
import ListButton from '../layout/ListButton'
import Loading from '../layout/Loading'
import DisplayText from '../layout/DisplayText'
import Divider from 'material-ui/Divider'
import BackButton from '../layout/BackButton'
import styles from '../../styles/pagestyle'

import type { Indicator, SubCategory } from '../../types'

export class CategoryStep extends Component{
	props: {
		countryCode: string,
		countryName: string,
    indicators: Array<Indicator>,
		indicatorMap: Object,
    stepIndex: number,
    variables: Array<Object>,
		year: number,
    categorySelected: (dataCategory: string, subCategory: any, stepIndex: number) => void,
		showPreviousStep: (stepIndex: number) => void,
	}

	state: {
		indicator: Object,
		categories: Object,
	}

	constructor() {
		super()
		this.state = {
			indicator: {},
			categories: {},
		}
	}

	render() {
		if (!this.props.variables || this.props.indicators.length === 0) {
      return (
				<div>
					<Loading />
					<DisplayText text={"Large amount of data are being fetched"} />
				</div>
			)
    }

		if (this.props.variables.length === 0) {
			return <DisplayText text={"There exist no data for " + this.props.countryName} />
		}

		generateCategories(this.props.variables, this.state.categories, this.props.indicatorMap)
		return (
			<div>
				<div style={styles.text}>
					<p>Select category from {this.props.countryName} - {this.props.year}</p>
				</div>
				<Divider/>
		 		<List>
		 			{Object.keys(this.state.categories).sort().map(category =>
						<ListButton key={category}
												label={category}
												onClick={() => this.props.categorySelected(category, this.state.categories[category], this.props.stepIndex)} />)}
		 		</List>
				<BackButton stepIndex={this.props.stepIndex} onClick={() => this.props.showPreviousStep(this.props.stepIndex)} />
		 	</div>
		 )
  }
}

function generateCategories(data: Array<Object>, categories: Object, indicatorMap: Object) {
	data.map(data => {
		if (categories[indicatorMap[data.IndicatorId].Level1] === undefined) {
			categories[indicatorMap[data.IndicatorId].Level1] = []
		}
		const inside = {}
		inside["Label"] = data.Indicator
		inside["ShortName"] = indicatorMap[data.IndicatorId].ShortName
    inside["Definition"] = indicatorMap[data.IndicatorId].Definition
		inside["IndicatorId"] = data.IndicatorId
		inside["DataId"] = data.DataId
		inside["SurveyId"] = data.SurveyId
		inside["MeasurementType"] = indicatorMap[data.IndicatorId].MeasurementType
		inside["Value"] = data.Value
		categories[indicatorMap[data.IndicatorId].Level1].push(inside)
		return inside
	})
}

const mapStateToProps = (state) => ({
	countryCode: state.survey.countryCode,
	countryName: state.survey.countryName,
	indicators: state.fetching.indicators,
	indicatorMap: state.survey.indicatorMap,
	stepIndex: state.routing.stepIndex,
	variables: state.fetching.variables,
	year: state.survey.year
})

const mapDispatchToProps = (dispatch) => ({
	categorySelected: (dataCategory: string, subCategory: Array<SubCategory>, stepIndex: number) => {
		dispatch({ type: 'CATEGORY_SELECTED', dataCategory: dataCategory, subCategory: subCategory })
		dispatch({ type: 'PAGE_REQUESTED', name: 'SelectData', stepIndex: stepIndex })
	},
	showPreviousStep: (stepIndex: number) => dispatch({ type: 'PREVIOUS_PAGE_REQUESTED', stepIndex: stepIndex })
})

const ConnectedPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(CategoryStep)

export default ConnectedPage
