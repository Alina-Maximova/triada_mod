// app/documentation.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Linking,
    useWindowDimensions
} from 'react-native';
import {
    Card,
    Text,
    useTheme,
    Button,
    Appbar
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MarkdownDisplay from 'react-native-markdown-display';

// Базовые URL
const DOCSIFY_BASE_URL = 'https://alina-maximova.github.io/construction-docs/#/';
const RAW_BASE_URL = 'https://raw.githubusercontent.com/Alina-Maximova/construction-docs/main/';

export default function DocumentationScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { width: screenWidth } = useWindowDimensions();

    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    // Переход на форму авторизации
    const handleLoginPress = () => {
        console.log('Navigate to login form');
        router.push('/(auth)');
    };

    // Преобразование docsify URL в raw GitHub URL
    const docsifyToRawUrl = (docsifyUrl: string): string => {
        const match = docsifyUrl.match(/#\/(.+)/);
        if (match && match[1]) {
            const docsifyPath = match[1];
            return `${RAW_BASE_URL}${docsifyPath}/README.md`;
        }
        return `${RAW_BASE_URL}README.md`;
    };

    // Преобразование относительного пути изображения в абсолютный GitHub URL
    const resolveImageUrl = (imagePath: string): string => {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        let basePath = '';

        if (currentPath.startsWith(DOCSIFY_BASE_URL)) {
            const docsifyPath = currentPath.replace(DOCSIFY_BASE_URL, '');
            basePath = docsifyPath ? `${docsifyPath}/` : '';
        } else if (currentPath.includes('/')) {
            basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        }

        let resolvedPath = imagePath;

        if (imagePath.startsWith('./')) {
            resolvedPath = basePath + imagePath.slice(2);
        } else if (imagePath.startsWith('../')) {
            const parentPath = basePath.substring(0, basePath.lastIndexOf('/', basePath.length - 2) + 1);
            resolvedPath = parentPath + imagePath.slice(3);
        } else if (!imagePath.startsWith('/')) {
            resolvedPath = basePath + imagePath;
        } else {
            resolvedPath = imagePath.slice(1);
        }

        return `${RAW_BASE_URL}${resolvedPath}`;
    };

    // Загрузка Markdown контента
    const loadMarkdown = async (path: string) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Loading documentation for path:', path);

            let rawUrl: string;

            if (path.startsWith(DOCSIFY_BASE_URL)) {
                rawUrl = docsifyToRawUrl(path);
            } else if (path.includes('#')) {
                rawUrl = docsifyToRawUrl(`#/${path}`);
            } else {
                rawUrl = `${RAW_BASE_URL}${path}${path.includes('.md') ? '' : '/README.md'}`;
            }

            console.log('Fetching from raw URL:', rawUrl);

            const response = await fetch(rawUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let text = await response.text();

            // Обрабатываем изображения в Markdown - заменяем относительные пути
            text = processImageUrls(text);

            setMarkdown(text);
            setCurrentPath(path);

            if (!history.includes(path)) {
                setHistory(prev => [...prev, path]);
            }

        } catch (err: any) {
            console.error('Error loading documentation:', err);
            setError(`Не удалось загрузить документацию: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Обработка URL изображений в Markdown
    const processImageUrls = (markdownText: string): string => {
        const imageRegex = /!\[(.*?)\]\((.*?)\)/g;

        return markdownText.replace(imageRegex, (match, altText, imagePath) => {
            if (imagePath.startsWith('http')) {
                return match;
            }

            const resolvedUrl = resolveImageUrl(imagePath);
            console.log(`Resolved image: ${imagePath} -> ${resolvedUrl}`);
            return `![${altText}](${resolvedUrl})`;
        });
    };

    useEffect(() => {
        const initialSection = (params.section as string) || '';
        const initialPath = getInitialPath(initialSection);
        loadMarkdown(initialPath);
    }, [params.section]);

    const getInitialPath = (section: string): string => {
        const paths: { [key: string]: string } = {
            '': DOCSIFY_BASE_URL,
            main: DOCSIFY_BASE_URL,
            gettingStarted: 'getting-started',
            tasks: 'tasks',
            reports: 'reports',
            images: 'images',
            api: 'api',
            troubleshooting: 'troubleshooting'
        };

        return paths[section] || DOCSIFY_BASE_URL;
    };

    // Обработка кликов по ссылкам в документации
    const handleLinkPress = (url: string): boolean => {
        console.log('Link pressed:', url);

        if (url.startsWith('./') || url.startsWith('../')) {
            let newPath = '';

            if (currentPath.startsWith(DOCSIFY_BASE_URL)) {
                const currentDocsifyPath = currentPath.replace(DOCSIFY_BASE_URL, '');
                const basePath = currentDocsifyPath.substring(0, currentDocsifyPath.lastIndexOf('/') + 1);

                if (url.startsWith('./')) {
                    newPath = basePath + url.slice(2);
                } else if (url.startsWith('../')) {
                    const parentPath = basePath.substring(0, basePath.lastIndexOf('/', basePath.length - 2) + 1);
                    newPath = parentPath + url.slice(3);
                }
            } else {
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);

                if (url.startsWith('./')) {
                    newPath = basePath + url.slice(2);
                } else if (url.startsWith('../')) {
                    const parentPath = basePath.substring(0, basePath.lastIndexOf('/', basePath.length - 2) + 1);
                    newPath = parentPath + url.slice(3);
                }
            }

            console.log('Converted relative link to:', newPath);
            loadMarkdown(newPath);
            return false;
        }

        if (url.includes('construction-docs')) {
            if (url.includes('github.io')) {
                loadMarkdown(url);
            } else if (url.includes('raw.githubusercontent.com')) {
                const path = url.replace(RAW_BASE_URL, '').replace('README.md', '');
                loadMarkdown(path);
            }
            return false;
        }

        if (!url.startsWith('http') && !url.startsWith('#') && url.includes('/')) {
            loadMarkdown(url);
            return false;
        }

        if (url.startsWith('#')) {
            return false;
        }

        if (url.startsWith('http')) {
            Linking.openURL(url).catch(err => {
                console.error('Failed to open URL:', err);
                setError(`Не удалось открыть ссылку: ${err.message}`);
            });
            return false;
        }

        return true;
    };

    const goBack = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const previousPath = newHistory[newHistory.length - 1];
            setHistory(newHistory);
            loadMarkdown(previousPath);
        } else {
            router.back();
        }
    };

    const canGoBack = history.length > 1;

    const getPageTitle = (): string => {
        const titles: { [key: string]: string } = {
            '': 'Главная',
            [DOCSIFY_BASE_URL]: 'Главная',
            'getting-started': 'Начало работы',
            'tasks': 'Управление задачами',
            'reports': 'Отчеты и аналитика',
            'images': 'Работа с изображениями',
            'api': 'API документация',
            'troubleshooting': 'Решение проблем'
        };

        if (currentPath.startsWith(DOCSIFY_BASE_URL)) {
            const path = currentPath.replace(DOCSIFY_BASE_URL, '');
            return titles[path] || 'Документация';
        }

        return titles[currentPath] || 'Документация';
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Appbar.Header>
                    {canGoBack && <Appbar.BackAction onPress={goBack} />}
                    <Appbar.Content title={getPageTitle()} />
                    <Appbar.Action
                        icon="login"
                        onPress={handleLoginPress}
                    />
                </Appbar.Header>
                <View style={styles.centerContent}>
                    <Text style={{ marginTop: 16 }}>Загрузка документации...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Appbar.Header>
                    {canGoBack && <Appbar.BackAction onPress={goBack} />}
                    <Appbar.Content title={getPageTitle()} />
                    <Appbar.Action
                        icon="login"
                        onPress={handleLoginPress}
                    />
                </Appbar.Header>
                <View style={styles.centerContent}>
                    <Text variant="headlineSmall" style={{ color: theme.colors.error, textAlign: 'center' }}>
                        Ошибка загрузки
                    </Text>
                    <Text style={{ marginTop: 8, textAlign: 'center' }}>{error}</Text>
                    <Button
                        mode="contained"
                        onPress={() => loadMarkdown(currentPath)}
                        style={{ marginTop: 16 }}
                    >
                        Попробовать снова
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={() => loadMarkdown(DOCSIFY_BASE_URL)}
                        style={{ marginTop: 8 }}
                    >
                        На главную
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                {canGoBack && <Appbar.BackAction onPress={goBack} />}
                <Appbar.Content title={getPageTitle()} />
                <Appbar.Action
                    icon="home"
                    onPress={() => loadMarkdown(DOCSIFY_BASE_URL)}
                />
                <Appbar.Action
                    icon="login"
                    onPress={handleLoginPress}
                />
            </Appbar.Header>

            <ScrollView style={styles.scrollView}>
                <Card style={styles.card}>
                    <Card.Content>
                        <MarkdownDisplay
                            onLinkPress={handleLinkPress}
                            style={{
                                body: {
                                    fontSize: 16,
                                    lineHeight: 24,
                                    color: theme.colors.onSurface
                                },
                                heading1: {
                                    fontSize: 28,
                                    fontWeight: 'bold' as any,
                                    marginVertical: 16,
                                    color: theme.colors.primary
                                },
                                heading2: {
                                    fontSize: 24,
                                    fontWeight: '600' as any,
                                    marginVertical: 12,
                                    color: theme.colors.primary
                                },
                                heading3: {
                                    fontSize: 20,
                                    fontWeight: '600' as any,
                                    marginVertical: 8,
                                    color: theme.colors.primary
                                },
                                link: {
                                    color: theme.colors.primary,
                                    textDecorationLine: 'underline'
                                },
                                blockquote: {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderLeftColor: theme.colors.primary,
                                    borderLeftWidth: 4,
                                    paddingLeft: 12,
                                    marginVertical: 8,
                                },
                                code_inline: {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    fontFamily: 'monospace',
                                    color: theme.colors.onSurfaceVariant
                                },
                                code_block: {
                                    backgroundColor: theme.colors.surfaceVariant,
                                    padding: 12,
                                    borderRadius: 6,
                                    marginVertical: 8,
                                    fontFamily: 'monospace',
                                    color: theme.colors.onSurfaceVariant
                                },
                                // Стили для изображений с правильным масштабированием
                                image: {
                                    maxWidth: '100%',
                                    maxHeight: 500,
                                    borderRadius: 8,
                                    marginVertical: 12,
                                    alignSelf: 'center',
                                    resizeMode: 'contain'
                                }
                            }}
                        >
                            {markdown}
                        </MarkdownDisplay>
                    </Card.Content>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
});