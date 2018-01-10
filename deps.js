// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

var deps = {};

var src = 'src/',
  srcJS = src + 'js/';

// deps.envFile = 'config.yml';
deps.templateFolder = [srcJS + 'template'];
deps.config = srcJS + 'Config.js';

deps.JS = [
  // srcJS + 'lib/masonry.js',
  srcJS + 'lib/md5.js',
  // srcJS + 'lib/moment.js',
  srcJS + 'lib/L.Map.Sync.js',
  srcJS + 'lib/leaflet.rotatedMarker.js',

  // Namespace
  srcJS + 'Namespace.js',

  // app
  srcJS + 'App.js',

  // Utils
  srcJS + 'Utils.js',

  // Views
  srcJS + 'View/BaseView.js',
  srcJS + 'View/Panels/BasePanelView.js',
  srcJS + 'View/Panels/SplitPanelView.js',
  srcJS + 'View/Panels/MapPanelView.js',

  srcJS + 'View/Panels/IndicatorPanelView.js',

  srcJS + 'View/NotFoundView.js',
  srcJS + 'View/ErrorView.js',
  srcJS + 'View/HeaderView.js',
  srcJS + 'View/FooterView.js',
  srcJS + 'View/NavigationBarView.js',
  srcJS + 'View/LoginView.js',
  srcJS + 'View/DateView.js',
  srcJS + 'View/ScopeListView.js',
  srcJS + 'View/CategoriesListView.js',
  srcJS + 'View/MultiScopeListView.js',
  srcJS + 'View/SplitView.js',
  srcJS + 'View/DashboardView.deprecated.js',
  srcJS + 'View/PopUpView.js',
  srcJS + 'View/MenuPanelView.js',
  srcJS + 'View/EmbedView.js',

  // FILTERS
  srcJS + 'View/Filter/FilterView.js',

  // USERS
  srcJS + 'View/User/UserListView.js',
  srcJS + 'View/User/UserView.js',
  srcJS + 'View/User/UserInfoView.js',

  // ADMIN
  srcJS + 'View/Admin/PermissionView.js',
  srcJS + 'View/Admin/ScopeListView.js',
  srcJS + 'View/Admin/ScopeView.js',
  srcJS + 'View/Admin/ScopeCreateView.js',
  srcJS + 'View/Admin/CategoryView.js',
  srcJS + 'View/Admin/VariableView.js',
  srcJS + 'View/Admin/LogsView.js',

  // DEVICES
  srcJS + 'View/DeviceView.js',
  srcJS + 'View/Device/DeviceListView.js',
  srcJS + 'View/Device/DeviceView.js',

  // WIDGETS
  srcJS + 'View/widgets/WidgetBase.js',
  srcJS + 'View/widgets/WidgetTable.js',
  srcJS + 'View/widgets/WidgetContext.deprecated.js',
  srcJS + 'View/widgets/WidgetVariableValueView.deprecated.js',
  srcJS + 'View/widgets/WidgetCategorizedVariableValueView.js',
  srcJS + 'View/widgets/WidgetStackedBars.js',
  srcJS + 'View/widgets/WidgetStackedSingleBar.js',
  srcJS + 'View/widgets/WidgetClock.js',
  // srcJS + 'View/widgets/WidgetVariableView.js',
  srcJS + 'View/widgets/WidgetTableView.deprecated.js',
  srcJS + 'View/widgets/WidgetTablePaginatedView.js',

  srcJS + 'View/widgets/WidgetCorrelation.js',

  srcJS + 'View/widgets/Frames/WidgetFrame.js',
  srcJS + 'View/widgets/Frames/WidgetFrameContent.js',

  srcJS + 'View/widgets/WidgetSelectableVariable.js',

  srcJS + 'View/widgets/Charts/Utils.js',

  srcJS + 'View/widgets/Charts/BaseChart.js',
  srcJS + 'View/widgets/Charts/BarChart.js',
  srcJS + 'View/widgets/Charts/FillBarChart.js',
  srcJS + 'View/widgets/Charts/PieChart.js',
  srcJS + 'View/widgets/Charts/MultiBarChart.js',
  srcJS + 'View/widgets/Charts/ScatterChart.js',
  srcJS + 'View/widgets/Charts/MultiChart.js',
  srcJS + 'View/widgets/Charts/ComparisonChart.js',
  srcJS + 'View/widgets/Charts/LineChart.js',
  srcJS + 'View/widgets/Charts/BarsLineD3Chart.js',
  srcJS + 'View/widgets/Charts/GridChartView.js',

  srcJS + 'View/widgets/WidgetMultiVariableChart.js',
  srcJS + 'View/widgets/WidgetMultiVariableBarChart.js',
  srcJS + 'View/widgets/WidgetMultiVariableHorizontalChart.js',
  srcJS + 'View/widgets/WidgetMultiVariableStackedChart.js',
  srcJS + 'View/widgets/WidgetMultiDeviceChart.js',
  srcJS + 'View/widgets/WidgetMultiVariableAnalysisVarsChart.js',
  srcJS + 'View/widgets/WidgetGaugeView.js',
  srcJS + 'View/widgets/WidgetLviGaugeView.js',
  srcJS + 'View/widgets/WidgetDeviceMapView.js',
  srcJS + 'View/widgets/WidgetButtonLink.js',
  srcJS + 'View/widgets/WidgetButtonLinkBackground.js',
  srcJS + 'View/widgets/WidgetContainerView.js',
  srcJS + 'View/widgets/WidgetIndicatorGauge.js',
  srcJS + 'View/widgets/WidgetIndicatorTable.js',
  srcJS + 'View/widgets/WidgetVariable.js',
  srcJS + 'View/widgets/WidgetVersusVariables.js',
  srcJS + 'View/widgets/WidgetEmbed.js',

  // DEPRECATED
  srcJS + 'View/widgets/WidgetPieChart.deprecated.js',

  // DEVICES
  srcJS + 'View/widgets/Device/WidgetDeviceTable.js',
  srcJS + 'View/widgets/Device/WidgetDeviceFillBar.js',

  // Panels
  srcJS + 'View/Panels/Frames/FramesMasterPanelView.js',
  srcJS + 'View/Panels/Frames/FramesDataPanelView.js',

  // MAP
  srcJS + 'View/Map/BaseMapView.deprecated.js',
  srcJS + 'View/Map/BaseMapView.js',
  srcJS + 'View/Map/MapboxGLMapView.js',
  srcJS + 'View/Map/MapboxGLBaseMapSelectorView.js',
  srcJS + 'View/Map/BaseComparisonMapView.js',
  srcJS + 'View/Map/MapVectorPointsView.js',
  srcJS + 'View/Map/MapboxGLLegendView.js',
  srcJS + 'View/Map/LayerTreeView.js',
  srcJS + 'View/Map/FilterSpatialMapView.js',
  srcJS + 'View/Map/MapSearchView.js',
  srcJS + 'View/Map/LayerTreeFilters.js',
  srcJS + 'View/Map/LegendBaseMapView.js',
  srcJS + 'View/Map/ComparisonLegendMapView.js',
  srcJS + 'View/Map/Layer/MapboxGLLayer.js',
  

  // Models
  srcJS + 'Model/BaseModel.js',
  srcJS + 'Model/Context.js',
  srcJS + 'Model/VariablesModel.js',
  srcJS + 'Model/ScopeModel.js',
  srcJS + 'Model/FrameModel.js',
  srcJS + 'Model/NavigationBarModel.js',
  srcJS + 'Model/DeviceModel.js',
  srcJS + 'Model/EntitiesCounterModel.js',
  srcJS + 'Model/UserModel.js',
  srcJS + 'Model/Metadata/Variable.js',
  srcJS + 'Model/Metadata/Entity.js',
  srcJS + 'Model/Metadata/Category.js',
  srcJS + 'Model/Metadata/Scope.js',
  srcJS + 'Model/BaseChartConfigModel.js',
  srcJS + 'Model/StatsUserModel.js',

  // Collections
  srcJS + 'Collection/StaticVariablesCollection.js',
  srcJS + 'Collection/BaseCollection.js',
  srcJS + 'Collection/HistogramCollection.js',
  srcJS + 'Collection/Scope.js',
  srcJS + 'Collection/DeviceCollection.js',
  srcJS + 'Collection/Frames.js',
  srcJS + 'Collection/TabletoCsvCollection.js',
  srcJS + 'Collection/WidgetContextCollection.deprecated.js',
  srcJS + 'Collection/SearchMapCollection.js',
  srcJS + 'Collection/UserCollection.js',
  srcJS + 'Collection/PlacementCollection.js',
  srcJS + 'Collection/ScatterCollection.js',
  srcJS + 'Collection/EntitiesCounterCollection.js',
  srcJS + 'Collection/Variables.js',
  srcJS + 'Collection/DynamicLegendCollection.js',
  srcJS + 'Collection/DevicesGroupTimeserieCollection.js',
  srcJS + 'Collection/Metadata/Variable.js',
  srcJS + 'Collection/Metadata/Entity.js',
  srcJS + 'Collection/Metadata/Category.js',
  srcJS + 'Collection/Metadata/Catalog.js',
  srcJS + 'Collection/Metadata/Scope.js',
  srcJS + 'Collection/Metadata/ResourcePermission.js',

  // auth
  srcJS + 'Auth.js',
  srcJS + 'Metadata.js',

  // Router
  srcJS + 'Router.js'
];

deps.lessFile = [ src + 'css/styles.less' ];

deps.extraResources = [];

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
