export type Language = 'en' | 'af';

export interface Translations {
  // Navigation
  navLadder: string;
  navRecordMatch: string;
  navHistory: string;
  navAdmin: string;
  navKioskMode: string;
  navExitKiosk: string;
  navLanguage: string;

  // Ladder Screen
  ladderTitle: string;
  ladderNoPlayers: string;
  ladderAddPlayers: string;
  ladderNoChallenges: string;
  ladderChallenge: string;

  // Record Match Screen
  recordTitle: string;
  recordWinner: string;
  recordWinnerScore: string;
  recordOpponent: string;
  recordLoserScore: string;
  recordSelectWinner: string;
  recordSelectOpponent: string;
  recordRecording: string;
  recordMatch: string;
  recordSuccess: string;
  recordErrorSelectBoth: string;
  recordErrorDifferent: string;
  recordErrorCannotChallengeBelow: string;
  recordErrorMaxRank: string;
  recordErrorScoreInvalid: string;
  recordNoChallengable: string;

  // History Screen
  historyTitle: string;
  historyNoMatches: string;
  historyDate: string;
  historyWinner: string;
  historyScore: string;
  historyLoser: string;

  // Admin Screen
  adminTitle: string;
  adminAccess: string;
  adminEnterPin: string;
  adminAuthenticate: string;
  adminDefaultPin: string;
  adminIncorrectPin: string;
  adminLogout: string;
  adminPlayers: string;
  adminSettings: string;
  adminAddNewPlayer: string;
  adminPlayerName: string;
  adminAdd: string;
  adminExportCSV: string;
  adminImportCSV: string;
  adminSeedPlayers: string;
  adminCurrentPlayers: string;
  adminRank: string;
  adminEdit: string;
  adminDelete: string;
  adminSave: string;
  adminCancel: string;
  adminUpdatePin: string;
  adminPinPlaceholder: string;
  adminPinHeading: string;
  adminPlayerCreated: string;
  adminPlayerUpdated: string;
  adminPlayerDeleted: string;
  adminPinUpdated: string;
  adminSeedSuccess: string;
  adminImportSuccess: string;
  adminConfirmDelete: string;
  adminConfirmSeed: string;
  adminErrorNameRequired: string;
  adminErrorPinLength: string;
  adminErrorPinVerify: string;
  adminErrorGeneric: string;

  // Challenge Modal
  challengeTitle: string;
  challengeWinnerScore: string;
  challengeLoserScore: string;
  challengeCancel: string;
  challengeRecordMatch: string;
  challengeRecording: string;
  challengeSuccess: string;
  challengeErrorScore: string;
  challengeErrorInvalid: string;
  challengeErrorMaxRank: string;

  // Payment
  paymentTitle: string;
  paymentAmount: string;
  paymentDescription: string;
  paymentDescriptionPlaceholder: string;
  paymentFirstName: string;
  paymentLastName: string;
  paymentEmail: string;
  paymentCellNumber: string;
  paymentCancel: string;
  paymentProceed: string;
  paymentProcessing: string;
  paymentFor: string;
  paymentSuccess: string;
  paymentThankYou: string;
  paymentTransactionId: string;
  paymentPending: string;
  paymentPendingMessage: string;
  paymentFailed: string;
  paymentFailedMessage: string;
  paymentCancelled: string;
  paymentCancelledMessage: string;
  paymentReturnHome: string;
  paymentChecking: string;
  paymentErrorInvalidAmount: string;
  paymentErrorInvalidEmail: string;
  paymentErrorGeneric: string;
  adminPaymentSettings: string;
  adminPayfastMerchantId: string;
  adminPayfastMerchantKey: string;
  adminPayfastPassphrase: string;
  adminPaymentSettingsHeading: string;
  adminPaymentSettingsSaved: string;
  adminPaymentSettingsError: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    navLadder: '📊 Ladder',
    navRecordMatch: '🏆 Record Match',
    navHistory: '📜 History',
    navAdmin: '⚙️ Admin',
    navKioskMode: '🖥️ Kiosk Mode',
    navExitKiosk: '🖥️ Exit Kiosk',
    navLanguage: '🌐 Language',

    // Ladder Screen
    ladderTitle: 'Current Ladder',
    ladderNoPlayers: 'No players yet.',
    ladderAddPlayers: 'Add players in Admin to get started.',
    ladderNoChallenges: 'No challenges available',
    ladderChallenge: 'Challenge',

    // Record Match Screen
    recordTitle: 'Record Match Result',
    recordWinner: 'Winner',
    recordWinnerScore: 'Winner Score',
    recordOpponent: 'Opponent',
    recordLoserScore: 'Loser Score',
    recordSelectWinner: 'Select winner...',
    recordSelectOpponent: 'Select opponent...',
    recordRecording: 'Recording...',
    recordMatch: 'Record Match',
    recordSuccess: 'Match recorded successfully! Updating ladder...',
    recordErrorSelectBoth: 'Please select both winner and loser',
    recordErrorDifferent: 'Winner and loser must be different players',
    recordErrorCannotChallengeBelow: 'You cannot challenge players ranked below you',
    recordErrorMaxRank: 'You can only challenge players up to 3 ranks above you',
    recordErrorScoreInvalid: 'Winner score must be higher than loser score',
    recordNoChallengable: 'No challengable players above this player',

    // History Screen
    historyTitle: 'Match History',
    historyNoMatches: 'No matches recorded yet.',
    historyDate: 'Date',
    historyWinner: 'Winner',
    historyScore: 'Score',
    historyLoser: 'Loser',

    // Admin Screen
    adminTitle: 'Admin Panel',
    adminAccess: 'Admin Access',
    adminEnterPin: 'Enter PIN',
    adminAuthenticate: 'Authenticate',
    adminDefaultPin: 'Default PIN: 1234',
    adminIncorrectPin: 'Incorrect PIN',
    adminLogout: 'Logout',
    adminPlayers: 'Players',
    adminSettings: 'Settings',
    adminAddNewPlayer: 'Add New Player',
    adminPlayerName: 'Player name',
    adminAdd: 'Add',
    adminExportCSV: 'Export CSV',
    adminImportCSV: 'Import CSV',
    adminSeedPlayers: 'Seed Sample Players',
    adminCurrentPlayers: 'Current Players',
    adminRank: '#',
    adminEdit: 'Edit',
    adminDelete: 'Delete',
    adminSave: 'Save',
    adminCancel: 'Cancel',
    adminUpdatePin: 'Update PIN',
    adminPinPlaceholder: 'New PIN (min 4 characters)',
    adminPinHeading: 'Admin PIN',
    adminPlayerCreated: 'Player created successfully',
    adminPlayerUpdated: 'Player updated successfully',
    adminPlayerDeleted: 'Player deleted successfully',
    adminPinUpdated: 'Admin PIN updated successfully',
    adminSeedSuccess: 'Sample players added successfully',
    adminImportSuccess: 'Imported {count} players successfully',
    adminConfirmDelete: 'Are you sure you want to delete this player? This will also delete their match history.',
    adminConfirmSeed: 'This will add 8 sample players. Continue?',
    adminErrorNameRequired: 'Player name is required',
    adminErrorPinLength: 'PIN must be at least 4 characters',
    adminErrorPinVerify: 'Error verifying PIN',
    adminErrorGeneric: 'Failed to {action}',

    // Challenge Modal
    challengeTitle: 'Record Challenge Result',
    challengeWinnerScore: 'Winner Score',
    challengeLoserScore: 'Loser Score',
    challengeCancel: 'Cancel',
    challengeRecordMatch: 'Record Match',
    challengeRecording: 'Recording...',
    challengeSuccess: 'Match recorded successfully! Updating ladder...',
    challengeErrorScore: 'Winner score must be higher than loser score',
    challengeErrorInvalid: 'Invalid challenge: challenger must have a higher rank number than target',
    challengeErrorMaxRank: 'You can only challenge players up to 3 ranks above you',

    // Payment
    paymentTitle: '💳 Make Payment',
    paymentAmount: 'Amount',
    paymentDescription: 'Description',
    paymentDescriptionPlaceholder: 'Payment description (optional)',
    paymentFirstName: 'First Name',
    paymentLastName: 'Last Name',
    paymentEmail: 'Email Address',
    paymentCellNumber: 'Cell Number',
    paymentCancel: 'Cancel',
    paymentProceed: 'Proceed to Payfast',
    paymentProcessing: 'Processing...',
    paymentFor: 'Payment for',
    paymentSuccess: 'Payment Successful!',
    paymentThankYou: 'Thank you for your payment.',
    paymentTransactionId: 'Transaction ID',
    paymentPending: 'Payment Pending',
    paymentPendingMessage: 'Your payment is being processed. Please check back later.',
    paymentFailed: 'Payment Failed',
    paymentFailedMessage: 'Your payment could not be processed. Please try again.',
    paymentCancelled: 'Payment Cancelled',
    paymentCancelledMessage: 'You cancelled the payment. No charges were made.',
    paymentReturnHome: 'Return to Home',
    paymentChecking: 'Checking payment status...',
    paymentErrorInvalidAmount: 'Please enter a valid amount greater than 0',
    paymentErrorInvalidEmail: 'Please enter a valid email address',
    paymentErrorGeneric: 'An error occurred processing your payment. Please try again.',
    adminPaymentSettings: 'Payment Settings',
    adminPayfastMerchantId: 'Payfast Merchant ID',
    adminPayfastMerchantKey: 'Payfast Merchant Key',
    adminPayfastPassphrase: 'Payfast Passphrase (optional)',
    adminPaymentSettingsHeading: 'Payfast Configuration',
    adminPaymentSettingsSaved: 'Payment settings saved successfully',
    adminPaymentSettingsError: 'Failed to save payment settings',
  },
  af: {
    // Navigation
    navLadder: '📊 Leer',
    navRecordMatch: '🏆 Rekord Wedstryd',
    navHistory: '📜 Geskiedenis',
    navAdmin: '⚙️ Admin',
    navKioskMode: '🖥️ Kiosk Modus',
    navExitKiosk: '🖥️ Verlaat Kiosk',
    navLanguage: '🌐 Taal',

    // Ladder Screen
    ladderTitle: 'Huidige Leer',
    ladderNoPlayers: 'Nog geen spelers nie.',
    ladderAddPlayers: 'Voeg spelers by in Admin om te begin.',
    ladderNoChallenges: 'Geen uitdagings beskikbaar',
    ladderChallenge: 'Daag Uit',

    // Record Match Screen
    recordTitle: 'Rekord Wedstryd Resultaat',
    recordWinner: 'Wenner',
    recordWinnerScore: 'Wenner Telling',
    recordOpponent: 'Tegenstander',
    recordLoserScore: 'Verloorder Telling',
    recordSelectWinner: 'Kies wenner...',
    recordSelectOpponent: 'Kies teenstander...',
    recordRecording: 'Rekordeer...',
    recordMatch: 'Rekord Wedstryd',
    recordSuccess: 'Wedstryd suksesvol geregistreer! Leer word opgedateer...',
    recordErrorSelectBoth: 'Kies asseblief beide wenner en verloorder',
    recordErrorDifferent: 'Wenner en verloorder moet verskillende spelers wees',
    recordErrorCannotChallengeBelow: 'Jy kan nie spelers wat onder jou gerangskik is uitdaag nie',
    recordErrorMaxRank: 'Jy kan slegs spelers tot 3 posisies bo jou uitdaag',
    recordErrorScoreInvalid: 'Wenner telling moet hoër as verloorder telling wees',
    recordNoChallengable: 'Geen uitdaagbare spelers bo hierdie speler',

    // History Screen
    historyTitle: 'Wedstryd Geskiedenis',
    historyNoMatches: 'Nog geen wedstryde geregistreer nie.',
    historyDate: 'Datum',
    historyWinner: 'Wenner',
    historyScore: 'Telling',
    historyLoser: 'Verloorder',

    // Admin Screen
    adminTitle: 'Admin Paneel',
    adminAccess: 'Admin Toegang',
    adminEnterPin: 'Voer PIN In',
    adminAuthenticate: 'Verifieer',
    adminDefaultPin: 'Standaard PIN: 1234',
    adminIncorrectPin: 'Verkeerde PIN',
    adminLogout: 'Teken Uit',
    adminPlayers: 'Spelers',
    adminSettings: 'Instellings',
    adminAddNewPlayer: 'Voeg Nuwe Speler By',
    adminPlayerName: 'Speler naam',
    adminAdd: 'Voeg By',
    adminExportCSV: 'Voer CSV Uit',
    adminImportCSV: 'Voer CSV In',
    adminSeedPlayers: 'Saai Voorbeeld Spelers',
    adminCurrentPlayers: 'Huidige Spelers',
    adminRank: '#',
    adminEdit: 'Wysig',
    adminDelete: 'Skrap',
    adminSave: 'Stoor',
    adminCancel: 'Kanselleer',
    adminUpdatePin: 'Dateer PIN Op',
    adminPinPlaceholder: 'Nuwe PIN (min 4 karakters)',
    adminPinHeading: 'Admin PIN',
    adminPlayerCreated: 'Speler suksesvol geskep',
    adminPlayerUpdated: 'Speler suksesvol opgedateer',
    adminPlayerDeleted: 'Speler suksesvol geskrap',
    adminPinUpdated: 'Admin PIN suksesvol opgedateer',
    adminSeedSuccess: 'Voorbeeld spelers suksesvol bygevoeg',
    adminImportSuccess: '{count} spelers suksesvol ingevoer',
    adminConfirmDelete: 'Is jy seker jy wil hierdie speler skrap? Dit sal ook hul wedstryd geskiedenis skrap.',
    adminConfirmSeed: 'Dit sal 8 voorbeeld spelers byvoeg. Gaan voort?',
    adminErrorNameRequired: 'Speler naam is vereis',
    adminErrorPinLength: 'PIN moet minstens 4 karakters wees',
    adminErrorPinVerify: 'Fout met verifiëring van PIN',
    adminErrorGeneric: 'Kon nie {action} nie',

    // Challenge Modal
    challengeTitle: 'Rekord Uitdaging Resultaat',
    challengeWinnerScore: 'Wenner Telling',
    challengeLoserScore: 'Verloorder Telling',
    challengeCancel: 'Kanselleer',
    challengeRecordMatch: 'Rekord Wedstryd',
    challengeRecording: 'Rekordeer...',
    challengeSuccess: 'Wedstryd suksesvol geregistreer! Leer word opgedateer...',
    challengeErrorScore: 'Wenner telling moet hoër as verloorder telling wees',
    challengeErrorInvalid: 'Ongeldige uitdaging: uitdager moet \'n hoër rangnommer as teiken hê',
    challengeErrorMaxRank: 'Jy kan slegs spelers tot 3 posisies bo jou uitdaag',

    // Payment
    paymentTitle: '💳 Maak Betaling',
    paymentAmount: 'Bedrag',
    paymentDescription: 'Beskrywing',
    paymentDescriptionPlaceholder: 'Betalingsbeskrywing (opsioneel)',
    paymentFirstName: 'Voornaam',
    paymentLastName: 'Van',
    paymentEmail: 'E-pos Adres',
    paymentCellNumber: 'Sel Nommer',
    paymentCancel: 'Kanselleer',
    paymentProceed: 'Gaan na Payfast',
    paymentProcessing: 'Verwerk...',
    paymentFor: 'Betaling vir',
    paymentSuccess: 'Betaling Suksesvol!',
    paymentThankYou: 'Dankie vir jou betaling.',
    paymentTransactionId: 'Transaksie ID',
    paymentPending: 'Betaling Hangend',
    paymentPendingMessage: 'Jou betaling word verwerk. Kyk asseblief later weer.',
    paymentFailed: 'Betaling Misluk',
    paymentFailedMessage: 'Jou betaling kon nie verwerk word nie. Probeer asseblief weer.',
    paymentCancelled: 'Betaling Gekanselleer',
    paymentCancelledMessage: 'Jy het die betaling gekanselleer. Geen gelde is gehef nie.',
    paymentReturnHome: 'Keer Terug na Tuis',
    paymentChecking: 'Kontroleer betalingsstatus...',
    paymentErrorInvalidAmount: 'Voer asseblief \'n geldige bedrag groter as 0 in',
    paymentErrorInvalidEmail: 'Voer asseblief \'n geldige e-pos adres in',
    paymentErrorGeneric: '\'n Fout het voorgekom met die verwerking van jou betaling. Probeer asseblief weer.',
    adminPaymentSettings: 'Betalingsinstellings',
    adminPayfastMerchantId: 'Payfast Handelaar ID',
    adminPayfastMerchantKey: 'Payfast Handelaar Sleutel',
    adminPayfastPassphrase: 'Payfast Wagwoord (opsioneel)',
    adminPaymentSettingsHeading: 'Payfast Konfigurasie',
    adminPaymentSettingsSaved: 'Betalingsinstellings suksesvol gestoor',
    adminPaymentSettingsError: 'Kon nie betalingsinstellings stoor nie',
  },
};

