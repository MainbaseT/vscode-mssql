/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { useContext, useEffect, useState } from "react";
import {
    Button,
    Checkbox,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerHeaderTitle,
    InfoLabel,
    Label,
    makeStyles,
    SearchBox,
    SelectTabData,
    SelectTabEvent,
    Tab,
    TabList,
    TabValue,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { locConstants as loc } from "../../../common/locConstants";
import { schemaCompareContext } from "../SchemaCompareStateProvider";
import { DacDeployOptionPropertyBoolean } from "vscode-mssql";

const useStyles = makeStyles({
    drawerBody: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
    },

    searchContainer: {
        margin: "10px 0",
        width: "100%",
    },

    tabContainer: {
        flexShrink: 0,
    },

    tabContentContainer: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
    },

    masterCheckboxContainer: {
        margin: "10px 0",
        borderBottom: "1px solid var(--colorNeutralStroke2)",
        marginBottom: "0px",
        backgroundColor: "var(--colorNeutralBackground2)",
        position: "sticky",
        top: 0,
        zIndex: 1,
        flexShrink: 0,
    },

    masterCheckbox: {
        fontWeight: "600",
        fontSize: "14px",
    },

    scrollableList: {
        flex: 1,
        overflowY: "auto",
        minHeight: 0,
        paddingTop: "8px",
        width: "100%",
    },

    listItemContainer: {
        display: "flex",
        alignItems: "center",
    },
});

interface Props {
    show: boolean;
    showDrawer: (show: boolean) => void;
}

const SchemaOptionsDrawer = (props: Props) => {
    const classes = useStyles();
    const context = useContext(schemaCompareContext);
    const [optionsChanged, setOptionsChanged] = useState(false);
    const [selectedValue, setSelectedValue] = useState<TabValue>("generalOptions");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        context.setIntermediarySchemaOptions();
    }, []);

    const deploymentOptions = context.state.intermediaryOptionsResult?.defaultDeploymentOptions;

    const optionsToValueNameLookup = deploymentOptions?.booleanOptionsDictionary;
    let generalOptionEntries: Array<[string, DacDeployOptionPropertyBoolean]> = [];
    if (optionsToValueNameLookup) {
        generalOptionEntries = Object.entries(optionsToValueNameLookup);

        generalOptionEntries.sort(([_, value1], [__, value2]) =>
            value1.displayName.toLowerCase().localeCompare(value2.displayName.toLowerCase()),
        );
    }

    const includeObjectTypesLookup = deploymentOptions?.objectTypesDictionary;
    let includeObjectTypesEntries: Array<[string, string]> = [];
    if (includeObjectTypesLookup) {
        includeObjectTypesEntries = Object.entries(includeObjectTypesLookup);

        includeObjectTypesEntries.sort(([key1, _], [key2, __]) =>
            key1.toLowerCase().localeCompare(key2.toLowerCase()),
        );
    }

    const filteredGeneralOptions = generalOptionEntries.filter(
        ([_, value]) =>
            searchQuery === "" ||
            value.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const filteredObjectTypes = includeObjectTypesEntries.filter(
        ([_, value]) =>
            searchQuery === "" || value.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const onTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
        setSelectedValue(data.value);
    };

    const handleSettingChanged = (key: string) => {
        context.intermediaryGeneralOptionsChanged(key);

        setOptionsChanged(true);
    };

    const handleObjectTypesOptionChanged = (key: string) => {
        context.intermediaryIncludeObjectTypesOptionsChanged(key);

        setOptionsChanged(true);
    };

    const handleSetObjectTypesCheckedState = (optionName: string): boolean => {
        const isFound = deploymentOptions.excludeObjectTypes.value?.find(
            (o) => o.toLowerCase() === optionName.toLowerCase(),
        );

        return isFound === undefined ? true : false;
    };

    // Helper functions for master checkbox states
    const getGeneralOptionsMasterCheckboxState = () => {
        if (!optionsToValueNameLookup || filteredGeneralOptions.length === 0) {
            return { checked: false, indeterminate: false };
        }

        const checkedCount = filteredGeneralOptions.filter(([_, value]) => value.value).length;

        if (checkedCount === 0) {
            return { checked: false, indeterminate: false };
        } else if (checkedCount === filteredGeneralOptions.length) {
            return { checked: true, indeterminate: false };
        } else {
            return { checked: false, indeterminate: true };
        }
    };

    const getObjectTypesMasterCheckboxState = () => {
        if (!includeObjectTypesLookup || filteredObjectTypes.length === 0) {
            return { checked: false, indeterminate: false };
        }

        const checkedCount = filteredObjectTypes.filter(([key, _]) =>
            handleSetObjectTypesCheckedState(key),
        ).length;

        if (checkedCount === 0) {
            return { checked: false, indeterminate: false };
        } else if (checkedCount === filteredObjectTypes.length) {
            return { checked: true, indeterminate: false };
        } else {
            return { checked: false, indeterminate: true };
        }
    };

    // Handlers for master checkboxes
    const handleGeneralOptionsMasterCheckbox = (checked: boolean) => {
        const keys = filteredGeneralOptions.map(([key, _]) => key);
        context.intermediaryGeneralOptionsBulkChanged(keys, checked);
        setOptionsChanged(true);
    };

    const handleObjectTypesMasterCheckbox = (checked: boolean) => {
        const keys = filteredObjectTypes.map(([key, _]) => key);
        context.intermediaryIncludeObjectTypesBulkChanged(keys, checked);
        setOptionsChanged(true);
    };

    const generalMasterState = getGeneralOptionsMasterCheckboxState();
    const objectTypesMasterState = getObjectTypesMasterCheckboxState();

    return (
        <Drawer
            separator
            open={props.show}
            onOpenChange={(_, { open: show }) => props.showDrawer(show)}
            position="end"
            size="medium">
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label={loc.schemaCompare.close}
                            icon={<Dismiss24Regular />}
                            onClick={() => props.showDrawer(false)}
                        />
                    }>
                    {loc.schemaCompare.schemaCompareOptions}
                </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody className={classes.drawerBody}>
                <SearchBox
                    className={classes.searchContainer}
                    placeholder={loc.schemaCompare.searchOptions}
                    value={searchQuery}
                    onChange={(_, data) => setSearchQuery(data.value)}
                />

                <TabList
                    className={classes.tabContainer}
                    selectedValue={selectedValue}
                    onTabSelect={onTabSelect}>
                    <Tab id="GeneralOptions" value="generalOptions">
                        {loc.schemaCompare.generalOptions}
                    </Tab>
                    <Tab id="IncludeObjectTypes" value="includeObjectTypes">
                        {loc.schemaCompare.includeObjectTypes}
                    </Tab>
                </TabList>

                {selectedValue === "generalOptions" && (
                    <div className={classes.tabContentContainer}>
                        {optionsToValueNameLookup && filteredGeneralOptions.length > 0 && (
                            <div className={classes.masterCheckboxContainer}>
                                <Checkbox
                                    className={classes.masterCheckbox}
                                    checked={
                                        generalMasterState.indeterminate
                                            ? "mixed"
                                            : generalMasterState.checked
                                    }
                                    onChange={(_, data) => {
                                        const isChecked =
                                            data.checked === "mixed" ? true : !!data.checked;
                                        handleGeneralOptionsMasterCheckbox(isChecked);
                                    }}
                                    label={loc.schemaCompare.selectAllOptions}
                                />
                            </div>
                        )}
                        <div className={classes.scrollableList}>
                            {optionsToValueNameLookup &&
                                filteredGeneralOptions.map(([key, value]) => {
                                    return (
                                        <div className={classes.listItemContainer} key={key}>
                                            <Checkbox
                                                checked={value.value}
                                                onChange={() => handleSettingChanged(key)}
                                                label={
                                                    <InfoLabel
                                                        aria-label={value.displayName}
                                                        info={<>{value.description}</>}>
                                                        {value.displayName}
                                                    </InfoLabel>
                                                }
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {selectedValue === "includeObjectTypes" && (
                    <div className={classes.tabContentContainer}>
                        {includeObjectTypesLookup && filteredObjectTypes.length > 0 && (
                            <div className={classes.masterCheckboxContainer}>
                                <Checkbox
                                    className={classes.masterCheckbox}
                                    checked={
                                        objectTypesMasterState.indeterminate
                                            ? "mixed"
                                            : objectTypesMasterState.checked
                                    }
                                    onChange={(_, data) => {
                                        const isChecked =
                                            data.checked === "mixed" ? true : !!data.checked;
                                        handleObjectTypesMasterCheckbox(isChecked);
                                    }}
                                    label={loc.schemaCompare.includeAllObjectTypes}
                                />
                            </div>
                        )}
                        <div className={classes.scrollableList}>
                            {includeObjectTypesLookup &&
                                filteredObjectTypes.map(([key, value]) => {
                                    return (
                                        <div className={classes.listItemContainer} key={key}>
                                            <Checkbox
                                                checked={handleSetObjectTypesCheckedState(key)}
                                                onChange={() => handleObjectTypesOptionChanged(key)}
                                                label={<Label aria-label={value}>{value}</Label>}
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </DrawerBody>
            <DrawerFooter>
                <Button appearance="secondary" onClick={() => context.resetOptions()}>
                    {loc.schemaCompare.reset}
                </Button>
                <Button
                    appearance="primary"
                    onClick={() => {
                        context.confirmSchemaOptions(optionsChanged);
                        props.showDrawer(false);
                    }}>
                    {loc.schemaCompare.ok}
                </Button>
                <Button appearance="secondary" onClick={() => props.showDrawer(false)}>
                    {loc.schemaCompare.cancel}
                </Button>
            </DrawerFooter>
        </Drawer>
    );
};

export default SchemaOptionsDrawer;
