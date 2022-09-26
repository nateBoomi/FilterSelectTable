
                const selectAllRef = React.createRef();
                
                class FilterSelectTable extends React.Component {
                    constructor(props) {
                        super(props);
                        this.state = {
                            isVisible: true,
                            height: null,
                            icon: 'toggle-icon glyphicon glyphicon-triangle-bottom',
                            windowWidth: window.innerWidth,
                            sortByOrder: 'ASC',
                            lastOrderBy: '',
                            objectData: null,
                        };
                        this.toggleVisibility = this.toggleVisibility.bind(this);
                        this.getLabel = this.getLabel.bind(this);
                        this.onHeaderClick = this.onHeaderClick.bind(this);
                        this.onSelect = this.onSelect.bind(this);
                        this.fetchFiles = this.fetchFiles.bind(this);
                        
                        //LARGE
                        this.onOutcomeClick = (e, outcome) => {
                            const objectDataId = e.currentTarget.parentElement.getAttribute('data-item');
                            this.props.onOutcome(objectDataId, outcome.id);
                        };
                        this.onCellEditCommitted = (id, propertyId, value) => {
                            const objectData = this.setPropertyValue(this.props.objectData, id, propertyId, value);
                            manywho.state.setComponent(this.props.id, { objectData }, this.props.flowKey, false);
                        };
                        
                    }
                    componentDidUpdate() {
                        //LARGE
                        const selectAll = selectAllRef.current;
                        if (selectAll) {
                            selectAll.indeterminate =
                                (this.props.selectedRows.length > 0 &&
                                    this.props.selectedRows.length !== this.props.totalObjectData);
                        }
                    }
                    componentDidMount() {
                        if (!this.props.isDesignTime) {
                            this.fetchFiles();
                        }
                    }
                    componentWillUnmount() {

                    }
                    onHeaderClick(e) {
                        console.log(this);
                        this.props.sort(e.currentTarget.dataset.sortProperty);
                    }
                    onSelect(e) {
                        e.stopPropagation();

                        for (let i = 0; i < this.props.objectData.length; i++){
                            if (this.props.objectData[i].internalId == e.currentTarget.id){
                                console.log(this.props.objectData[i]);
                                
                                if (this.props.objectData[i].properties[0].contentValue != 'false'){
                                    this.props.select(e.currentTarget.id);
                                }
                                
                                break;
                            }
                        }
                    }
                    getLabel(label, required) {
                        if (!manywho.utils.isNullOrWhitespace(label)) {
                            const labelClasses = manywho.settings.global('collapsible', this.props.flowKey)
                                ? 'container-label clickable-section'
                                : 'container-label';
                            const labelContent = (manywho.settings.global('collapsible', this.props.flowKey) && label)
                                ? [React.createElement("i", { key: manywho.utils.guid(), className: this.state.icon }), label]
                                : [label];
                            if (required) {
                                labelContent.push(React.createElement("span", { className: "input-required" }, " *"));
                            }
                            return (React.createElement("h3", { className: labelClasses, onClick: this.toggleVisibility }, labelContent));
                        }
                        return null;
                    }
                    getDisplayColumns(columns, outcomes) {
                        const displayColumns = manywho.component.getDisplayColumns(columns) || [];
                        if (outcomes.filter(outcome => !outcome.isBulkAction).length > 0) {
                            displayColumns.unshift('mw-outcomes');
                        }
                        return displayColumns;
                    }
                    toggleVisibility(event) {
                        event.preventDefault();
                        if (manywho.settings.global('collapsible', this.props.flowKey)) {
                            if (this.state.isVisible) {
                                this.setState({
                                    isVisible: false,
                                    height: findDOMNode(this).clientHeight,
                                    icon: 'toggle-icon glyphicon glyphicon-triangle-right',
                                });
                                requestAnimationFrame(() => {
                                    this.setState({ height: 0 });
                                });
                            }
                            else {
                                this.setState({
                                    isVisible: true,
                                    height: null,
                                    icon: 'toggle-icon glyphicon glyphicon-triangle-bottom',
                                });
                            }
                        }
                    }
                    fetchFiles() {
                        this.model = manywho.model.getComponent(this.props.id, this.props.flowKey);
                        if (this.model.fileDataRequest) {
                            const state = manywho.state.getComponent(this.props.id, this.props.flowKey);
                            manywho.engine.fileDataRequest(this.props.id, this.model.fileDataRequest, this.props.flowKey, manywho.settings.global('paging.table'), state ? state.search : '', null, null, state ? state.page : 1);
                        }
                    }
                    renderFooter(pageIndex, hasMoreResults, onNext, onPrev, onFirstPage, isDesignTime) {
		                const Pagination = manywho.component.getByName('mw-pagination');
                        if (pageIndex > 1 || hasMoreResults) {
                            const props = {
                                pageIndex,
                                hasMoreResults,
                                onNext,
                                onPrev,
                                onFirstPage,
                                isDesignTime,
                            };
                            return React.createElement(Pagination, Object.assign({}, props));
                        }
                        return null;
                    }
                    setPropertyValue(objectData, id, propertyId, value) {
                        //LARGE
                        return objectData.map((item) => {
                            item.properties = item.properties.map((prop) => {
                                if (manywho.utils.isEqual(prop.typeElementPropertyId, propertyId, true)
                                    && manywho.utils.isEqual(item.internalId, id, true)) {
                                    if (Array.isArray(value)) {
                                        prop.objectData = value;
                                    }
                                    else {
                                        prop.contentValue = value;
                                    }
                                }
                                return prop;
                            });
                            return item;
                        });
                    }
                    renderHeaderRow(displayColumns) {
                        //LARGE
                        let columns = [];
                        if (this.model.isMultiSelect && this.props.objectData) {
                            const checkboxProps = {
                                type: 'checkbox',
                                onChange: this.props.selectAll,
                                ref: selectAllRef,
                                checked: this.props.selectedRows.length === this.props.totalObjectData,
                            };
                            columns.push(React.createElement("th", { className: "checkbox-cell", key: "checkbox" },
                                React.createElement("input", Object.assign({}, checkboxProps))));
                        }
                        else if (manywho.utils.isEqual(this.model.attributes.radio, 'true', true)) {
                            columns.push(React.createElement("th", { key: "radio" }));
                        }
                        columns = columns.concat(displayColumns.map((column) => {
                            if (column === 'mw-outcomes') {
                                return React.createElement("th", { className: "table-outcome-column", key: "actions" }, "Actions");
                            }
                            const headerProps = {
                                id: column.typeElementPropertyId,
                                'data-sort-property': column.developerName,
                                key: `header-${column.typeElementPropertyId}`,
                                onClick: (this.props.onHeaderClick) ? this.props.onHeaderClick : null,
                            };
                            const headerChildren = [column.label];
                            if (manywho.utils.isEqual(this.props.sortedBy, column.typeElementPropertyId, true)) {
                                let iconClassName = 'table-header-icon glyphicon ';
                                iconClassName +=
                                    this.props.sortedIsAscending ?
                                        'glyphicon-menu-down' :
                                        'glyphicon-menu-up';
                                headerChildren.push(React.createElement("span", { className: iconClassName }));
                            }
                            return React.createElement("th", Object.assign({ key: column.typeElementPropertyId }, headerProps), headerChildren);
                        }));
                        return React.createElement("tr", { key: "header-row" }, columns);
                    }
                    checkRowIsSelected(selectedRow, row){
                        //LARGE
		                const rowSelectedOnClientSide = selectedRow.externalId || selectedRow.internalId;
		                const rowSelectedOnServerSide = row.externalId || row.internalId;
		                return rowSelectedOnServerSide === rowSelectedOnClientSide;
	                };
                    renderRows(flowKey, objectData, outcomes, displayColumns, selectedRows, onRowClicked, onSelect, outcomeDisplay) {
                        //LARGE
                        const Outcome = manywho.component.getByName('outcome');
                        const TableInput = manywho.component.getByName('table-input');
                        return objectData.map((item) => {
                            const isSelected = selectedRows.filter(row => this.checkRowIsSelected(row, item)).length > 0;
                            const className = (isSelected) ? 'info' : null;
                            let columns = [];
                            if (this.model.isMultiSelect) {
                                columns.push(React.createElement("td", { className: "checkbox-cell", key: "checkbox-cell" },
                                    React.createElement("input", { id: item.internalId, type: "checkbox", checked: isSelected, onClick: onSelect })));
                            }
                            else if (manywho.utils.isEqual(this.model.attributes.radio, 'true', true)) {
                                columns.push(React.createElement("td", { className: "checkbox-cell", key: "checkbox-cell" },
                                    React.createElement("input", { id: item.internalId, type: "radio", checked: isSelected, onClick: onSelect })));
                            }
                            columns = columns.concat(displayColumns.map((column) => {
                                if (column === 'mw-outcomes') {
                                    return (React.createElement("td", { className: "table-outcome-column", key: item.internalId + column, "data-item": item.internalId }, outcomes.map(outcome => (React.createElement(Outcome, { flowKey: flowKey, id: outcome.id, key: outcome.id, onClick: this.onOutcomeClick, display: outcomeDisplay.outcomes })))));
                                }
                                let selectedProperty = item.properties.find(property => property.typeElementPropertyId === column.typeElementPropertyId);
                                if (!manywho.utils.isNullOrWhitespace(column.typeElementPropertyToDisplayId)) {
                                    if (selectedProperty !== null &&
                                        selectedProperty.objectData !== null &&
                                        selectedProperty.objectData.length) {
                                        selectedProperty =
                                            selectedProperty.objectData[0].properties
                                                .find(childProperty => childProperty.typeElementPropertyId === column.typeElementPropertyToDisplayId);
                                    }
                                }
                                if (selectedProperty) {
                                    if (this.props.isFiles &&
                                        (manywho.utils.isEqual(selectedProperty.typeElementPropertyId, manywho.settings.global('files.downloadUriPropertyId'), true) ||
                                            manywho.utils.isEqual(selectedProperty.developerName, manywho.settings.global('files.downloadUriPropertyName'), true))) {
                                        const props = {
                                            href: selectedProperty.contentValue,
                                            target: '_blank',
                                        };
                                        const buttonClasses = ['btn', 'btn-sm'];
                                        if (manywho.utils.isNullOrWhitespace(selectedProperty.contentValue)) {
                                            buttonClasses.push('btn-default');
                                            props.disabled = 'disabled';
                                        }
                                        else {
                                            buttonClasses.push('btn-info');
                                        }
                                        props.className = buttonClasses.join(' ');
                                        return React.createElement("td", { key: "download" },
                                            React.createElement("a", Object.assign({}, props), "Download"));
                                    }
                                    if (!manywho.utils.isNullOrWhitespace(column.componentType)) {
                                        const columnProps = {
                                            id: item.internalId,
                                            propertyId: column.typeElementPropertyId,
                                            contentValue: selectedProperty.contentValue,
                                            objectData: selectedProperty.objectData,
                                            onCommitted: this.onCellEditCommitted,
                                            flowKey: this.props.flowKey,
                                            isEditable: column.isEditable,
                                            contentType: column.contentType,
                                            contentFormat: column.contentFormat,
                                        };
                                        return (React.createElement("td", { id: column.typeElementPropertyId, key: column.typeElementPropertyId },
                                            React.createElement(Dynamic, { name: column.componentType, props: columnProps })));
                                    }
                                    if (column.isEditable) {
                                        return (React.createElement("td", { id: column.typeElementPropertyId, key: column.typeElementPropertyId, className: "editable" }, React.createElement(TableInput, { id: item.internalId, propertyId: column.typeElementPropertyId, value: selectedProperty.contentValue, contentType: column.contentType, contentFormat: column.contentFormat, onCommitted: this.onCellEditCommitted, flowKey: this.props.flowKey })));
                                    }
                                    const contentValue = manywho.formatting.format(selectedProperty.contentValue, selectedProperty.contentFormat, selectedProperty.contentType, flowKey);
                                    return (React.createElement("td", { id: column.typeElementPropertyId, key: column.typeElementPropertyId },
                                        React.createElement("span", null, contentValue)));
                                }
                                return React.createElement("td", { key: column.typeElementPropertyId });
                            }));
                            // The row key cannot be the objects external id, as if flow is 
                            // offline the external id does not necessarily exist
                            return (React.createElement("tr", { className: className, id: item.internalId, key: item.internalId, onClick: onRowClicked }, columns));
                        });
                    }
                    renderContentElement() {
                        const isValid = (this.model.isValid !== undefined) ?
                            this.model.isValid :
                            this.props.isDesignTime && true;
                        const tableClassName = [
                            'table',
                            (this.model.attributes.borderless &&
                                manywho.utils.isEqual(this.model.attributes.borderless, 'true', true)) ?
                                '' :
                                'table-bordered',
                            (this.model.attributes.striped &&
                                manywho.utils.isEqual(this.model.attributes.striped, 'true', true)) ?
                                'table-striped' :
                                '',
                            (this.props.isSelectionEnabled) ? 'table-hover' : '',
                            (isValid) ? '' : 'table-invalid',
                        ].join(' ');
                        let rows = [this.renderHeaderRow(this.props.displayColumns)];
                        rows = rows.concat(this.renderRows(this.props.flowKey, this.props.objectData || [], this.props.outcomes, this.props.displayColumns, this.props.selectedRows, this.props.onRowClicked, this.props.onSelect, this.model.attributes));
                        return (React.createElement("div", { className: "table-responsive" },
                            React.createElement("table", { className: tableClassName },
                                React.createElement("tbody", null, rows))));
                    }
                    
                    render() {
                        manywho.log.info(`Rendering Table: ${this.props.id}`);
                        this.model = manywho.model.getComponent(this.props.id, this.props.flowKey);
                        const state = this.props.isDesignTime
                            ? { error: null, loading: false }
                            : manywho.state.getComponent(this.props.id, this.props.flowKey) || {};
                        const outcomes = manywho.model.getOutcomes(this.props.id, this.props.flowKey);
                        const selectedRows = (state.objectData || []).filter(objectData => objectData.isSelected);
                        this.props = {
                            selectedRows,
                            id: this.props.id,
                            objectData: this.props.objectData,
                            totalObjectData: (!this.model.objectDataRequest && this.model.objectData) ?
                                this.model.objectData.length :
                                null,
                            outcomes: outcomes.filter(outcome => !outcome.isBulkAction),
                            displayColumns: this.getDisplayColumns(this.model.columns, outcomes),
                            flowKey: this.props.flowKey,
                            lastSortedBy: this.state.lastSortedBy,
                            sortByOrder: this.state.sortByOrder,
                            isFiles: manywho.utils.isEqual(this.model.componentType, 'files', true),
                            isValid: !(this.model.isValid === false || state.isValid === false || state.error),
                            isDesignTime: this.props.isDesignTime,
                            sortedBy: this.props.sortedBy,
                            sortedIsAscending: this.props.sortedIsAscending,
                            sort: this.props.sort,
                            select: this.props.select,
                            onOutcome: this.props.onOutcome
                        };
                        if (!this.props.isDesignTime) {
                            this.props = manywho.utils.extend(this.props, {
                                onOutcome: this.props.onOutcome,
                                onSelect: this.onSelect,
                                selectAll: this.props.selectAll,
                                onHeaderClick: this.onHeaderClick,
                            });
                            if (this.model.attributes && !this.model.attributes.isRowSelectionDisabled) {
                                this.props.onRowClicked = this.onSelect;
                            }
                        }
                        const tableIsEditable = this.props.displayColumns.some(column => column.isEditable);
                        let { contentElement } = this.props;
                        if (!contentElement) {
                            contentElement = this.renderContentElement();
                        }
                        let classNames = 'table-container clear-fix';
                        if (this.model.isVisible === false) {
                            classNames += ' hidden';
                        }
                        const stylingClasses = manywho.styling.getClasses(this.props.parentId, this.props.id, 'table', this.props.flowKey).join(' ');
                        classNames += ` ${stylingClasses}`;
                        let labelElement = null;
                        if (!manywho.utils.isNullOrWhitespace(this.model.label)) {
                            labelElement = React.createElement("label", null, this.model.label);
                        }
                        let validationElement = null;
                        if (!this.props.isValid) {
                            validationElement = (React.createElement("div", { className: "has-error" },
                                React.createElement("span", { className: "help-block" }, this.model.validationMessage || state.validationMessage)));
                        }
                        let isDisabled = false;
                        if (this.model.isEnabled === false || this.props.isLoading) {
                            isDisabled = true;
                        }
		                const ItemsHeader = manywho.component.getByName('mw-items-header');
                        const itemsHeaderProps = {
                            isDisabled,
                            flowKey: this.props.flowKey,
                            isSearchable: this.model.isSearchable,
                            isRefreshable: (this.model.objectDataRequest || this.model.fileDataRequest),
                            onSearch: this.props.onSearch,
                            outcomes: manywho.model.getOutcomes(this.props.id, this.props.flowKey),
                            refresh: this.props.refresh,
                        };
                        const headerElement = React.createElement(ItemsHeader, Object.assign({}, itemsHeaderProps));
		                const Wait = manywho.component.getByName('wait');
                        return (React.createElement("div", { className: classNames, id: this.props.id },
                            labelElement,
                            validationElement,
                            React.createElement("div", { className: `clearfix ${(this.state.isVisible ? '' : ' hidden')}` },
                                headerElement,
                                contentElement,
                                this.renderFooter(this.props.page, this.props.hasMoreResults, this.props.onNext, this.props.onPrev, this.props.onFirstPage, this.props.isDesignTime),
                                React.createElement(Wait, { isVisible: state.loading, message: state.loading && state.loading.message, isSmall: true }))));
                    }
                }
                manywho.component.registerItems("FilterSelectTable", FilterSelectTable);