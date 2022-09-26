# FilterSelectTable

DEMO: https://us.flow-prod.boomi.com/ef3210f4-6711-4ce9-ac6c-6212be3767e5/play/DemoPlayer/?flow-id=151f660c-bacf-4da9-89e2-1098234d261b

This component limits what entries can be selected inside of a table, by hijacking the onSelect method.  This example checks if the value of the first element is not set to 'false', however this logic can be adjusted accordingly.

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
					
To select a specfiic column of the table to filter by, I recommend iterating through this.props.objectData until the entry with the correct header name is found.