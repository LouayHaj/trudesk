import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import $ from 'jquery';

import helpers from 'lib/helpers';

import { updateSetting } from 'actions/settings';

class SingleSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        };
    }

    componentDidMount() {
        helpers.UI.selectize();
        const $select = $(this.select);

        $select.on('change', this.props.onSelectChange);
    }

    componentWillUnmount() {
        const selectize = this.select.selectize;

        if (selectize)
            selectize.destroy();
    }

    static getDerivedStateFromProps(props, state) {
        if (props.value !== state.value) {
            return {
                value: props.value
            };
        }

        return null;
    }

    valueChanged(value) {
        this.props.updateSetting({name: this.props.settingName, value: value, stateName: this.props.stateName});
    }

    updateValue(evt) {
        if (evt.target.value && (evt.target.value !== this.state.value))
            this.valueChanged(evt.target.value);
    }

    render() {
        const { items } = this.props;
        let width = '75%';

        if (this.select && this.select.selectize) {
            this.select.selectize.addItem(this.state.value, true);
        }

        if (this.props.width)
            width = this.props.width;

        return (
            <div className="uk-width-3-4 uk-float-right" style={{paddingRight: '10px', width: width}}>
                <select className="selectize" ref={select => { this.select = select; }} data-md-selectize data-md-selectize-bottom value={this.state.value} onChange={this.props.onSelectChange}>
                    { items.map(function(obj, i) {
                        return <option key={i} value={obj.value}>{obj.label}</option>;
                    })}
                </select>
            </div>
        );
    }
}

SingleSelect.propTypes = {
    updateSetting: PropTypes.func.isRequired,
    settingName: PropTypes.string.isRequired,
    stateName: PropTypes.string.isRequired,
    value: PropTypes.string,
    width: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectChange: PropTypes.func.isRequired
};

export default connect(null, { updateSetting })(SingleSelect);