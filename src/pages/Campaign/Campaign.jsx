import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Button, CustomTable } from "../../components";
import { MainLayout } from "../../layouts";
import { CampaignContext } from "../../utils/contexts/CampaignContext";
import styles from "./Campaign.module.scss";
// import { TabContext, TabPanel, TabList } from "@mui/lab";
import { Box, Tab, Tabs, styled, Skeleton } from "@mui/material";
import { TabIcon } from "../../assets";
import { CurrentContext } from "../../utils/contexts";
import { getCommercial, getROI, KMBFormatter } from "../../utils";
import { tableData } from "../../utils/constants";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function newSelectionArist(item, campaign) {
  console.log({ item });
  const brandCommercial = item.brandCommercial || "NA";
  let newArtist = {
    ...item,
    key: item._id,
    _id: item._id,
    name: item.name,
    link: campaign.deliverable?.includes("YT")
      ? item.youtube?.link
      : campaign.deliverable?.includes("IG")
      ? item.instagram?.link
      : "NA",
    followers: item.instagram ? item.instagram.followers : "NA",
    averageViews: campaign.deliverable?.includes("YT")
      ? item.youtube?.averageViews
      : campaign.deliverable?.includes("IG")
      ? item.instagram?.averageViews
      : 0,
    deliverable: item.deliverable || campaign.deliverable || "NA",
    brandCommercial,
    cpvBrand: (parseInt(brandCommercial) / parseInt(item.views) || 0).toFixed(
      2
    ),
    gender: item.gender,
    location: item.location,
    languages: item.languages,
    categories: item.categories,
    type: item.type,
    date: item.date,
    note: item.note || ".",
    deliverableLink: item.deliverableLink || "NA",
    views: item.views || "NA",
    comments: item.comments || "NA",
    roi: getROI(item),
  };
  if (campaign.extras?.length) {
    campaign.extras.forEach((it) => {
      newArtist[it.dataIndex] = item[it.dataIndex] || ".";
    });
  }

  return newArtist;
}

const Campaign = () => {
  // const [campaign, setCampaign] = useState({});
  const { tabIndex, setTabIndex, table, setCampaignId } =
    useContext(CurrentContext);
  const handleTabsChange = (event, newValue) => {
    setTabIndex(newValue);
    setTab(newValue);
  };

  const location = useLocation();

  const [tab, setTab] = useState(0);

  const { campaign, setCampaign, campaignMain, campaignAnalytics } =
    useContext(CurrentContext);
  const [mainCols, setMainCols] = useState(tableData.campaign.main.columns);
  const [data, setData] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    setCampaignId(id);
  }, [id]);

  useEffect(() => {
    console.log({ campaign });
  }, [campaign]);

  useEffect(() => {
    console.log({ campaign });
    if (campaign.extras?.length) {
      setMainCols([
        ...tableData.campaign.main.columns,
        ...campaign.extras
          .filter((item) => item.isVisible)
          .map((item) => ({
            ...item,
            searchable: true,
            // editable: true,
          })),
      ]);
    }
    if (campaign?.selectedArtists) {
      console.log({ selected: campaign.selectedArtists });
      setData(
        campaign.selectedArtists.map((item) =>
          newSelectionArist(item, campaign)
        )
      );
    }
  }, [campaign]);

  // useEffect(() => {
  //   async function fetchData() {
  //     const temp = await fetchCampaign(id);
  //     setCampaign(temp.data);
  //     console.log({ temp });
  //   }
  //   if (id) {
  //     fetchData();
  //   }
  // }, [id]);

  function handleSelectRow(rows) {
    setCampaign({ ...campaign, selectedArtists: rows });
  }

  return (
    <MainLayout
      classes={[styles.container]}
      isSideMenuVisible
      campaignId={id}
      navbarProps={{
        titleProps: {
          id: "name",
          disabled: true,
          isBackIconVisible: true,
          name: campaign?.name,
          brandName: campaign?.brand?.name,
        },
        prevRoute: "/",
      }}
      moreInformationProps={{
        isVisible: true,
        agencyFees: campaign?.agencyFee,
        brandAmount: campaign?.brandAmount,
        totalAverageViews: KMBFormatter(campaign?.totalAverageViews || 0),
        totalCreator: data?.length.toString() || "0",
        averageROI: campaign?.averageROI || "0.0",
      }}
    >
      <div className={styles.tablesContainer}>
        {location.pathname.includes("analytics") && (
          <div className={styles.tableContainer}>
            <CustomTable
              columns={tableData.campaign_analytics.columns}
              data={data}
              onRowSelect={handleSelectRow}
              selectedRows={data || []}
            />
          </div>
        )}
        {!location.pathname.includes("analytics") && (
          <>
            <div className={styles.tabs}>
              <Tabs value={tab} onChange={handleTabsChange} aria-label="Tabs">
                <Tab
                  icon={<TabIcon filled={tabIndex === 0} value={0} />}
                  // value={0}
                  aria-label="Overview"
                />
                <Tab
                  icon={<TabIcon filled={tabIndex === 1} value={1} />}
                  // value={1}
                />
              </Tabs>
            </div>

            {/* </Box> */}
            {/* )} */}
            <TabPanel value={tab} index={0}>
              <div className={styles.tableContainer}>
                {data?.length > 0 ? (
                  <CustomTable
                    columns={mainCols}
                    data={data}
                    onRowSelect={handleSelectRow}
                    selectedRows={data || []}
                    campaign={campaign}
                  />
                ) : (
                  <Skeleton variant="rectangular" width="100%" height={200} />
                )}
              </div>
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <div className={styles.tableContainer}>
                {data?.length > 0 ? (
                  <CustomTable
                    columns={tableData.campaign.info.columns}
                    data={data}
                    onRowSelect={handleSelectRow}
                    selectedRows={data || []}
                    campaign={campaign}
                  />
                ) : (
                  <Skeleton variant="rectangular" width="100%" height={200} />
                )}
              </div>
            </TabPanel>
          </>
        )}
      </div>
    </MainLayout>
  );
};

// const StyledTabList = styled(TabList)(() => {
//   return {
//     ".MuiTabs-indicator": {
//       backgroundColor: "var(--clr-primary)",
//     },
//   };
// });

export default Campaign;
