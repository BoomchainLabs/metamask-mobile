import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  BackHandler,
  View,
  ScrollView,
  StyleSheet,
  InteractionManager,
  Animated,
  Easing,
} from 'react-native';
import Text, {
  TextVariant,
} from '../../../component-library/components/Texts/Text';
import StorageWrapper from '../../../store/storage-wrapper';
import {
  fontStyles,
  baseStyles,
  colors as importedColors,
} from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import { connect } from 'react-redux';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import { getTransparentOnboardingNavbarOptions } from '../../UI/Navbar';
import Device from '../../../util/device';
import BaseNotification from '../../UI/Notification/BaseNotification';
import ElevatedView from 'react-native-elevated-view';
import { loadingSet, loadingUnset } from '../../../actions/user';
import { storePrivacyPolicyClickedOrClosed as storePrivacyPolicyClickedOrClosedAction } from '../../../reducers/legalNotices';
import PreventScreenshot from '../../../core/PreventScreenshot';
import { PREVIOUS_SCREEN, ONBOARDING } from '../../../constants/navigation';
import { EXISTING_USER } from '../../../constants/storage';
import { MetaMetricsEvents } from '../../../core/Analytics';
import { withMetricsAwareness } from '../../hooks/useMetrics';
import { Authentication } from '../../../core';
import { ThemeContext, mockTheme } from '../../../util/theme';
import { OnboardingSelectorIDs } from '../../../../e2e/selectors/Onboarding/Onboarding.selectors';
import Routes from '../../../constants/navigation/Routes';
import { selectAccounts } from '../../../selectors/accountTrackerController';
import trackOnboarding from '../../../util/metrics/TrackOnboarding/trackOnboarding';
import LottieView from 'lottie-react-native';
import { MetricsEventBuilder } from '../../../core/Analytics/MetricsEventBuilder';
import Button, {
  ButtonVariants,
  ButtonWidthTypes,
  ButtonSize,
} from '../../../component-library/components/Buttons/Button';

import fox from '../../../animations/Searching_Fox.json';
import { saveOnboardingEvent } from '../../../actions/onboarding';

const createStyles = (colors) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 30,
    },
    foxWrapper: {
      width: Device.isLargeDevice() ? 200 : 175,
      height: Device.isLargeDevice() ? 200 : 175,
      marginVertical: 20,
    },
    image: {
      alignSelf: 'center',
      width: Device.isLargeDevice() ? 200 : 175,
      height: Device.isLargeDevice() ? 200 : 175,
    },
    largeFoxWrapper: {
      alignItems: 'center',
      paddingTop: Device.isLargeDevice() ? 60 : 40,
      paddingBottom: Device.isLargeDevice() ? 100 : 40,
    },
    foxImage: {
      width: 145,
      height: 145,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 40,
      lineHeight: 40,
      justifyContent: 'center',
      textAlign: 'center',
      paddingHorizontal: 60,
      fontFamily: 'MMSans-Regular',
      color: importedColors.gettingStartedTextColor,
    },
    ctas: {
      flex: 1,
      position: 'relative',
      width: '100%',
      paddingHorizontal: 20,
    },
    footer: {
      marginTop: -40,
      marginBottom: 40,
    },
    login: {
      fontSize: 18,
      color: colors.primary.default,
      ...fontStyles.normal,
    },
    buttonDescription: {
      textAlign: 'center',
      marginBottom: 16,
    },
    importWrapper: {
      marginVertical: 16,
    },
    createWrapper: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      rowGap: 16,
      marginBottom: 16,
    },
    buttonWrapper: {
      flexDirection: 'column',
      justifyContent: 'flex-end',
      gap: 16,
      width: '100%',
    },
    buttonLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 8,
    },
    loader: {
      marginTop: 180,
      justifyContent: 'center',
      textAlign: 'center',
    },
    loadingText: {
      marginTop: 30,
      textAlign: 'center',
    },
    modalTypeView: {
      position: 'absolute',
      bottom: 0,
      paddingBottom: Device.isIphoneX() ? 20 : 10,
      left: 0,
      right: 0,
      backgroundColor: importedColors.transparent,
    },
    notificationContainer: {
      flex: 0.1,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border.muted,
    },
    bottomSheetContainer: {
      padding: 16,
      flexDirection: 'column',
      rowGap: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    socialBtn: {
      borderColor: colors.border.muted,
      borderWidth: 1,
      color: colors.text.default,
    },
    createWalletButton: {
      borderRadius: 12,
      color: importedColors.whiteTransparent,
      backgroundColor: importedColors.btnBlack,
    },
    existingWalletButton: {
      borderRadius: 12,
      color: importedColors.btnBlack,
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: importedColors.btnBlack,
    },
  });

/**
 * View that is displayed to first time (new) users
 */
class Onboarding extends PureComponent {
  static propTypes = {
    disableNewPrivacyPolicyToast: PropTypes.func,
    /**
     * The navigator object
     */
    navigation: PropTypes.object,
    /**
     * redux flag that indicates if the user set a password
     */
    passwordSet: PropTypes.bool,
    /**
     * loading status
     */
    loading: PropTypes.bool,
    /**
     * set loading status
     */
    setLoading: PropTypes.func,
    /**
     * unset loading status
     */
    unsetLoading: PropTypes.func,
    /**
     * loadings msg
     */
    loadingMsg: PropTypes.string,
    /**
     * Object that represents the current route info like params passed to it
     */
    route: PropTypes.object,
    /**
     * Metrics injected by withMetricsAwareness HOC
     */
    metrics: PropTypes.object,
    /**
     * Function to save onboarding event prior to metrics being enabled
     */
    dispatchSaveOnboardingEvent: PropTypes.func,
  };
  notificationAnimated = new Animated.Value(100);
  detailsYAnimated = new Animated.Value(0);
  actionXAnimated = new Animated.Value(0);
  detailsAnimated = new Animated.Value(0);

  animatedTimingStart = (animatedRef, toValue) => {
    Animated.timing(animatedRef, {
      toValue,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  state = {
    warningModalVisible: false,
    loading: false,
    existingUser: false,
    createWallet: false,
    existingWallet: false,
    bottomSheetVisible: false,
    errorSheetVisible: false,
  };

  seedwords = null;
  importedAccounts = null;
  channelName = null;
  incomingDataStr = '';
  dataToSync = null;
  mounted = false;

  warningCallback = () => true;

  showNotification = () => {
    // show notification
    this.animatedTimingStart(this.notificationAnimated, 0);
    // hide notification
    setTimeout(() => {
      this.animatedTimingStart(this.notificationAnimated, 200);
    }, 4000);
    this.disableBackPress();
  };

  disableBackPress = () => {
    // Disable back press
    const hardwareBackPress = () => true;
    BackHandler.addEventListener('hardwareBackPress', hardwareBackPress);
  };

  updateNavBar = () => {
    const { route, navigation } = this.props;
    const colors = this.context.colors || mockTheme.colors;
    navigation.setOptions(
      getTransparentOnboardingNavbarOptions(
        colors,
        importedColors.gettingStartedPageBackgroundColor,
        true,
        importedColors.btnBlack,
      ),
    );
  };

  componentDidMount() {
    this.props.unsetLoading();
    this.updateNavBar();
    this.mounted = true;
    this.checkIfExistingUser();
    this.props.disableNewPrivacyPolicyToast();

    InteractionManager.runAfterInteractions(() => {
      PreventScreenshot.forbid();
      if (this.props.route.params?.delete) {
        this.props.setLoading(strings('onboarding.delete_current'));
        setTimeout(() => {
          this.showNotification();
          this.props.unsetLoading();
        }, 2000);
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.unsetLoading();
    InteractionManager.runAfterInteractions(PreventScreenshot.allow);
  }

  componentDidUpdate = () => {
    this.updateNavBar();
  };

  async checkIfExistingUser() {
    const existingUser = await StorageWrapper.getItem(EXISTING_USER);
    if (existingUser !== null) {
      this.setState({ existingUser: true });
    }
  }

  onLogin = async () => {
    const { passwordSet } = this.props;
    if (!passwordSet) {
      await Authentication.resetVault();
      this.props.navigation.replace(Routes.ONBOARDING.HOME_NAV);
    } else {
      await Authentication.lockApp();
      this.props.navigation.replace(Routes.ONBOARDING.LOGIN);
    }
  };

  handleExistingUser = (action) => {
    if (this.state.existingUser) {
      this.alertExistingUser(action);
    } else {
      action();
    }
  };

  onPressCreate = () => {
    const action = () => {
      const { metrics } = this.props;
      if (metrics.isEnabled()) {
        this.props.navigation.navigate('ChoosePassword', {
          [PREVIOUS_SCREEN]: ONBOARDING,
        });
        this.track(MetaMetricsEvents.WALLET_SETUP_STARTED);
      } else {
        this.props.navigation.navigate('OptinMetrics', {
          onContinue: () => {
            this.props.navigation.replace('ChoosePassword', {
              [PREVIOUS_SCREEN]: ONBOARDING,
            });
            this.track(MetaMetricsEvents.WALLET_SETUP_STARTED);
          },
        });
      }
    };

    this.handleExistingUser(action);
  };

  onPressImport = () => {
    const action = async () => {
      const { metrics } = this.props;
      if (metrics.isEnabled()) {
        this.props.navigation.push(
          Routes.ONBOARDING.IMPORT_FROM_SECRET_RECOVERY_PHRASE,
        );
        this.track(MetaMetricsEvents.WALLET_IMPORT_STARTED);
      } else {
        this.props.navigation.navigate('OptinMetrics', {
          onContinue: () => {
            this.props.navigation.replace(
              Routes.ONBOARDING.IMPORT_FROM_SECRET_RECOVERY_PHRASE,
            );
            this.track(MetaMetricsEvents.WALLET_IMPORT_STARTED);
          },
        });
      }
    };
    this.handleExistingUser(action);
  };

  track = (event) => {
    trackOnboarding(
      MetricsEventBuilder.createEventBuilder(event).build(),
      this.props.dispatchSaveOnboardingEvent,
    );
  };

  alertExistingUser = (callback) => {
    this.warningCallback = () => {
      callback();
      this.toggleWarningModal();
    };
    this.toggleWarningModal();
  };

  toggleWarningModal = () => {
    const warningModalVisible = this.state.warningModalVisible;
    this.setState({ warningModalVisible: !warningModalVisible });
  };

  renderLoader = () => {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View style={styles.wrapper}>
        <View style={styles.loader}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>{this.props.loadingMsg}</Text>
        </View>
      </View>
    );
  };

  renderContent() {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View style={styles.ctas}>
        <View style={styles.largeFoxWrapper}>
          <LottieView
            style={styles.image}
            autoPlay
            loop
            source={fox}
            resizeMode="contain"
          />
        </View>

        <Text
          variant={TextVariant.HeadingSMRegular}
          style={styles.title}
          testID={OnboardingSelectorIDs.SCREEN_TITLE}
        >
          {strings('onboarding.title')}
        </Text>

        <View style={styles.createWrapper}>
          <Button
            variant={ButtonVariants.Primary}
            onPress={() => this.onPressCreate()}
            testID={OnboardingSelectorIDs.NEW_WALLET_BUTTON}
            label={strings('onboarding.start_exploring_now')}
            width={ButtonWidthTypes.Full}
            size={ButtonSize.Lg}
            style={styles.createWalletButton}
          />
          <Button
            variant={ButtonVariants.Secondary}
            onPress={this.onPressImport}
            testID={OnboardingSelectorIDs.IMPORT_SEED_BUTTON}
            width={ButtonWidthTypes.Full}
            size={ButtonSize.Lg}
            style={styles.existingWalletButton}
            label={
              <Text
                variant={TextVariant.BodyMDMedium}
                color={importedColors.btnBlack}
              >
                {strings('onboarding.have_existing_wallet')}
              </Text>
            }
          />
        </View>
      </View>
    );
  }

  handleSimpleNotification = () => {
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    if (!this.props.route.params?.delete) return;
    return (
      <Animated.View
        style={[
          styles.notificationContainer,
          { transform: [{ translateY: this.notificationAnimated }] },
        ]}
      >
        <ElevatedView style={styles.modalTypeView} elevation={100}>
          <BaseNotification
            closeButtonDisabled
            status="success"
            data={{
              title: strings('onboarding.success'),
              description: strings('onboarding.your_wallet'),
            }}
          />
        </ElevatedView>
      </Animated.View>
    );
  };

  render() {
    const { loading } = this.props;
    const { existingUser } = this.state;
    const colors = this.context.colors || mockTheme.colors;
    const styles = createStyles(colors);

    return (
      <View
        style={[
          baseStyles.flexGrow,
          { backgroundColor: importedColors.gettingStartedPageBackgroundColor },
        ]}
        testID={OnboardingSelectorIDs.CONTAINER_ID}
      >
        <ScrollView
          style={baseStyles.flexGrow}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.wrapper}>
            {loading && (
              <View style={styles.largeFoxWrapper}>
                <LottieView
                  style={styles.image}
                  autoPlay
                  loop
                  source={fox}
                  resizeMode="contain"
                />
              </View>
            )}
            {loading ? this.renderLoader() : this.renderContent()}
          </View>

          {existingUser && !loading && (
            <View style={styles.footer}>
              <Button
                variant={ButtonVariants.Link}
                onPress={this.onLogin}
                label={strings('onboarding.unlock')}
                width={ButtonWidthTypes.Full}
                size={ButtonSize.Lg}
              />
            </View>
          )}
        </ScrollView>

        <FadeOutOverlay />

        <View>{this.handleSimpleNotification()}</View>
      </View>
    );
  }
}

Onboarding.contextType = ThemeContext;

const mapStateToProps = (state) => ({
  accounts: selectAccounts(state),
  passwordSet: state.user.passwordSet,
  loading: state.user.loadingSet,
  loadingMsg: state.user.loadingMsg,
});

const mapDispatchToProps = (dispatch) => ({
  setLoading: (msg) => dispatch(loadingSet(msg)),
  unsetLoading: () => dispatch(loadingUnset()),
  disableNewPrivacyPolicyToast: () =>
    dispatch(storePrivacyPolicyClickedOrClosedAction()),
  dispatchSaveOnboardingEvent: (event) => dispatch(saveOnboardingEvent(event)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withMetricsAwareness(Onboarding));
